
export const getFileExtension = ( name: string ): string => name.split( '.' ).pop()?.toLowerCase() ?? '';
