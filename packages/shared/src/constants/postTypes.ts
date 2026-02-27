export const PostType = {
  TEXT: 'text',
  LINK: 'link',
  CODE: 'code',
} as const;

export type PostType = (typeof PostType)[keyof typeof PostType];
