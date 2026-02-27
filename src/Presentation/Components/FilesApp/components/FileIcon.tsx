import type { FC } from 'react';
import { createElement } from 'react';
import * as VscIcons from 'react-icons/vsc';
import { getFileExtension } from '@/Shared/Utils/getFileExtension';
import type { FileIconProps } from '@/Shared/Interfaces/IFileIconProps';

const EXTENSION_ICONS: Record<string, keyof typeof VscIcons> = {
  pdf: 'VscFilePdf',
  md: 'VscMarkdown',
  txt: 'VscFile',
  jpg: 'VscFileMedia',
  jpeg: 'VscFileMedia',
  png: 'VscFileMedia',
  gif: 'VscFileMedia',
  svg: 'VscFileCode',
  ts: 'VscFileCode',
  tsx: 'VscFileCode',
  js: 'VscFileCode',
  jsx: 'VscFileCode',
  json: 'VscJson',
  html: 'VscFileCode',
  css: 'VscFileCode',
};

const FileIcon: FC<FileIconProps> = ({ type, name = '', folderNode, fileNode, size = 20 }) => {
  if (type === 'folder') {
    if (folderNode?.iconName) {
      const Icon = VscIcons[folderNode.iconName as keyof typeof VscIcons] as
        | React.ElementType
        | undefined;
      if (Icon) {
        return createElement(Icon, {
          size,
          color: folderNode.iconColor ?? undefined,
          'aria-hidden': 'true',
        });
      }
    }
    return createElement(VscIcons.VscFolder, { size, 'aria-hidden': 'true' });
  }

  if (type === 'file' && fileNode?.iconName) {
    const Icon = VscIcons[fileNode.iconName as keyof typeof VscIcons] as
      | React.ElementType
      | undefined;
    if (Icon) {
      return createElement(Icon, {
        size,
        color: fileNode.iconColor ?? undefined,
        'aria-hidden': 'true',
      });
    }
  }

  const ext = getFileExtension(name);
  const iconKey = EXTENSION_ICONS[ext] ?? 'VscFile';
  const Icon = VscIcons[iconKey] as React.ElementType;
  return createElement(Icon, { size, 'aria-hidden': 'true' });
};

export default FileIcon;
