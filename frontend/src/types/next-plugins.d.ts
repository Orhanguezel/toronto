// types/next-plugins.d.ts
declare module '@next/bundle-analyzer' {
  const create: (opts: { enabled?: boolean }) => <T>(config: T) => T;
  export default create;
}
declare module '@next/mdx' {
  const mdx: (opts?: any) => <T>(config: T) => T;
  export default mdx;
}
