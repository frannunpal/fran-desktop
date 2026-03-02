import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { Extension } from '@tiptap/core';
import {
  VscBold,
  VscItalic,
  VscCode,
  VscListUnordered,
  VscListOrdered,
  VscQuote,
  VscTerminal,
  VscDiscard,
  VscRedo,
  VscHorizontalRule,
} from 'react-icons/vsc';
import { BiStrikethrough } from 'react-icons/bi';
import { FcSynchronize } from 'react-icons/fc';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import {
  FilePickerModal,
  FileSaveModal,
  type FileSaveResult,
} from '@presentation/Components/Shared/FilePickerApp/FilePickerApp';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { TEXT_MIME_TYPES } from '@/Shared/Utils/getAppIdForMime';
import type { WindowContentProps } from '@/Shared/Interfaces/IWindowContentProps';
import classes from './NotesApp.module.css';
import { LuHeading1, LuHeading2 } from 'react-icons/lu';

const ACCEPTED_MD_TYPES = [...TEXT_MIME_TYPES];

const ClearMarksOnEnter = Extension.create({
  name: 'clearMarksOnEnter',
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { state, dispatch } = editor.view;
        const { selection, schema } = state;
        const { $from, empty } = selection;
        if (!empty || $from.parent.type !== schema.nodes.paragraph) return false;
        const tr = state.tr.split($from.pos).setStoredMarks([]);
        dispatch(tr);
        return true;
      },
    };
  },
});

export interface NotesAppActions {
  new: () => void;
  save: () => void;
  saveAs: () => void;
}

const WELCOME_URL = 'Desktop/NotesAppWelcome.md';

async function resolveContent(content: string, url?: string): Promise<string> {
  if (content) return content;
  if (!url) return '';
  const base = import.meta.env.BASE_URL as string;
  const src = url.startsWith('http') ? url : `${base}${url}`;
  const res = await fetch(src);
  if (!res.ok) return '';
  return res.text();
}

const NotesApp: FC<WindowContentProps> = ({ window, notifyReady }) => {
  const win = window;
  const contentData = win?.contentData as
    | { fileId?: string; initialContent?: string; initialName?: string; url?: string }
    | undefined;
  const [fileName, setFileName] = useState<string>(contentData?.initialName ?? 'untitled.md');
  const [isDirty, setIsDirty] = useState(false);
  const welcomeLoadedRef = useRef(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const pendingSaveMode = useRef<'save' | 'saveAs'>('save');
  const fileIdRef = useRef<string | null>(contentData?.fileId ?? null);

  const createFile = useDesktopStore(state => state.createFile);
  const updateFile = useDesktopStore(state => state.updateFile);

  const setDirty = useCallback((value: boolean) => {
    setIsDirty(value);
  }, []);

  const setDirtyRef = useRef(setDirty);
  useEffect(() => {
    setDirtyRef.current = setDirty;
  }, [setDirty]);

  const editor = useEditor({
    extensions: [StarterKit, Markdown, ClearMarksOnEnter],
    content: contentData?.initialContent ?? '',
    contentType: 'markdown',
    shouldRerenderOnTransaction: false,
    onUpdate: () => {
      setDirtyRef.current(true);
    },
  });

  useEffect(() => {
    if (welcomeLoadedRef.current || !editor) return;
    welcomeLoadedRef.current = true;
    let src: string | null = null;
    if (!contentData) src = WELCOME_URL;
    else if (contentData.url && !contentData.initialContent) src = contentData.url;
    if (!src) return;
    const base = import.meta.env.BASE_URL as string;
    const fullUrl = src.startsWith('http') ? src : `${base}${src}`;
    fetch(fullUrl)
      .then(r => (r.ok ? r.text() : ''))
      .then(md => {
        if (md) editor.commands.setContent(md, { emitUpdate: false, contentType: 'markdown' });
      })
      .catch(() => {});
  }, [editor, contentData]);

  const getMarkdown = useCallback((): string => {
    if (!editor) return '';
    return editor.getMarkdown();
  }, [editor]);

  const handleNew = useCallback(() => {
    welcomeLoadedRef.current = true;
    editor?.commands.setContent('', { emitUpdate: false, contentType: 'markdown' });
    fileIdRef.current = null;
    setFileName('untitled.md');
    setDirty(false);
  }, [editor, setDirty]);

  const handleSave = useCallback(() => {
    if (!editor) return;
    const currentFileId = fileIdRef.current;
    if (currentFileId) {
      updateFile(currentFileId, getMarkdown());
      setDirty(false);
    } else {
      pendingSaveMode.current = 'save';
      setSaveModalOpen(true);
    }
  }, [editor, getMarkdown, updateFile, setDirty]);

  const handleSaveAs = useCallback(() => {
    if (!editor) return;
    pendingSaveMode.current = 'saveAs';
    setSaveModalOpen(true);
  }, [editor]);

  const handleSaveConfirm = useCallback(
    ({ parentId, name }: FileSaveResult) => {
      if (!editor) return;
      const content = getMarkdown();
      if (pendingSaveMode.current === 'saveAs' || !fileIdRef.current) {
        const file = createFile(name, content, parentId);
        fileIdRef.current = file.id;
        setFileName(file.name);
      } else {
        updateFile(fileIdRef.current, content);
      }
      setDirty(false);
      setSaveModalOpen(false);
    },
    [editor, getMarkdown, createFile, updateFile, setDirty],
  );

  const [pickerOpen, setPickerOpen] = useState(false);

  const handleFileSelected = useCallback(
    (node: FileNode) => {
      fileIdRef.current = node.id;
      setFileName(node.name);
      setDirty(false);
      setPickerOpen(false);
      resolveContent(node.content, node.url).then(md => {
        editor?.commands.setContent(md, { emitUpdate: false, contentType: 'markdown' });
      });
    },
    [editor, setDirty],
  );

  useEffect(() => {
    const actions: NotesAppActions = { new: handleNew, save: handleSave, saveAs: handleSaveAs };
    notifyReady?.({
      ...(win?.contentData ?? {}),
      actions,
      isDirty,
      setPickerOpen: () => setPickerOpen(true),
    });
  }, [handleNew, handleSave, handleSaveAs, isDirty, win, notifyReady]);

  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      canUndo: ctx.editor?.can().undo() ?? false,
      canRedo: ctx.editor?.can().redo() ?? false,
      isBold: ctx.editor?.isActive('bold') ?? false,
      isItalic: ctx.editor?.isActive('italic') ?? false,
      isStrike: ctx.editor?.isActive('strike') ?? false,
      isCode: ctx.editor?.isActive('code') ?? false,
      isH1: ctx.editor?.isActive('heading', { level: 1 }) ?? false,
      isH2: ctx.editor?.isActive('heading', { level: 2 }) ?? false,
      isBulletList: ctx.editor?.isActive('bulletList') ?? false,
      isOrderedList: ctx.editor?.isActive('orderedList') ?? false,
      isBlockquote: ctx.editor?.isActive('blockquote') ?? false,
      isCodeBlock: ctx.editor?.isActive('codeBlock') ?? false,
    }),
  });

  return (
    <div className={classes.container} data-windowid={win?.id}>
      <div className={classes.toolbar} role="toolbar" aria-label="Text formatting">
        <button
          className={`${classes.toolbarBtn} ${editorState?.isBold ? classes.active : ''}`}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor?.can().chain().focus().toggleBold().run()}
          title="Bold"
          aria-label="Bold"
        >
          <VscBold />
        </button>
        <button
          className={`${classes.toolbarBtn} ${editorState?.isItalic ? classes.active : ''}`}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor?.can().chain().focus().toggleItalic().run()}
          title="Italic"
          aria-label="Italic"
        >
          <VscItalic />
        </button>
        <button
          className={`${classes.toolbarBtn} ${editorState?.isStrike ? classes.active : ''}`}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          disabled={!editor?.can().chain().focus().toggleStrike().run()}
          title="Strikethrough"
          aria-label="Strikethrough"
        >
          <BiStrikethrough />
        </button>
        <button
          className={`${classes.toolbarBtn} ${editorState?.isCode ? classes.active : ''}`}
          onClick={() => editor?.chain().focus().toggleCode().run()}
          disabled={!editor?.can().chain().focus().toggleCode().run()}
          title="Inline code"
          aria-label="Inline code"
        >
          <VscCode />
        </button>

        <span className={classes.separator} />

        <button
          className={`${classes.toolbarBtn} ${editorState?.isH1 ? classes.active : ''}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
          aria-label="Heading 1"
        >
          <LuHeading1 />
        </button>
        <button
          className={`${classes.toolbarBtn} ${editorState?.isH2 ? classes.active : ''}`}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
          aria-label="Heading 2"
        >
          <LuHeading2 />
        </button>

        <span className={classes.separator} />

        <button
          className={`${classes.toolbarBtn} ${editorState?.isBulletList ? classes.active : ''}`}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet list"
          aria-label="Bullet list"
        >
          <VscListUnordered />
        </button>
        <button
          className={`${classes.toolbarBtn} ${editorState?.isOrderedList ? classes.active : ''}`}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Ordered list"
          aria-label="Ordered list"
        >
          <VscListOrdered />
        </button>

        <span className={classes.separator} />

        <button
          className={`${classes.toolbarBtn} ${editorState?.isBlockquote ? classes.active : ''}`}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
          aria-label="Blockquote"
        >
          <VscQuote />
        </button>
        <button
          className={`${classes.toolbarBtn} ${editorState?.isCodeBlock ? classes.active : ''}`}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          title="Code block"
          aria-label="Code block"
        >
          <VscTerminal />
        </button>
        <button
          className={classes.toolbarBtn}
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
          aria-label="Horizontal rule"
        >
          <VscHorizontalRule />
        </button>

        <span className={classes.separator} />

        <button
          className={classes.toolbarBtn}
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editorState?.canUndo}
          title="Undo"
          aria-label="Undo"
        >
          <VscDiscard />
        </button>
        <button
          className={classes.toolbarBtn}
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editorState?.canRedo}
          title="Redo"
          aria-label="Redo"
        >
          <VscRedo />
        </button>

        {isDirty && (
          <span className={classes.dirtyIndicator} title="Unsaved changes">
            <FcSynchronize />
          </span>
        )}
      </div>

      <EditorContent editor={editor} className={classes.editorContent} />

      <FilePickerModal
        opened={pickerOpen}
        acceptedMimeTypes={ACCEPTED_MD_TYPES}
        onConfirm={handleFileSelected}
        onCancel={() => setPickerOpen(false)}
      />

      <FileSaveModal
        opened={saveModalOpen}
        initialName={fileName}
        onConfirm={handleSaveConfirm}
        onCancel={() => setSaveModalOpen(false)}
      />
    </div>
  );
};

export default NotesApp;
