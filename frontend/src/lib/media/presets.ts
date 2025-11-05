export const IMG = {
  thumb:   (id:string)=> `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload/f_auto,q_auto,c_thumb,g_custom,w_320,h_320/${id}`,
  card:    (id:string)=> `.../image/upload/f_auto,q_auto,c_fill,g_custom,w_600,h_400/${id}`,
  hero:    (id:string)=> `.../image/upload/f_auto,q_auto,c_fill,g_custom,w_1600,h_700/${id}`,
};
export const VID = {
  hls:     (id:string)=> `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/video/upload/f_auto,vc_auto:video/hls/${id}.m3u8`,
  poster:  (id:string)=> `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload/f_auto,q_auto,c_fill,g_custom,w_1200,h_675/${id}.jpg`,
};