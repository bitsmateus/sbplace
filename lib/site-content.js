// Conteúdo institucional que muda pouco (podcast, café). Para adicionar um
// episódio novo: baixe a capa do YouTube em public/podcast/ e acrescente aqui.

export const YOUTUBE_CHANNEL = "https://www.youtube.com/@sb_place";

// Do mais recente para o mais antigo.
export const PODCAST_EPISODES = [
  {
    number: 4,
    guest: "Edi Carvalho",
    role: "CEO Edi Car Service",
    duration: "32 min",
    videoId: "g39BKN3o7fQ",
    cover: "/podcast/ep4.webp",
  },
  {
    number: 3,
    guest: "Murilo Nunes",
    role: "Ciclista e CEO DMB digital",
    duration: "33 min",
    videoId: "LGUrngo3woc",
    cover: "/podcast/ep3.webp",
  },
  {
    number: 2,
    guest: "Waldir Fretta",
    role: "",
    duration: "25 min",
    videoId: "CWXXhBjxw2U",
    cover: "/podcast/ep2.webp",
  },
  {
    number: 1,
    guest: "Eraldo Rosa",
    role: "Fundador da Eraldo Construções",
    duration: "16 min",
    videoId: "95H8uq3PLYc",
    cover: "/podcast/ep1.webp",
  },
];

export const CAFE = {
  name: "My Coffee Shop Project",
  instagram: "mycoffeeshopproject",
};

// Vídeo "Nossa história". Cole aqui o ID do vídeo do YouTube (a parte depois de
// "watch?v=" ou de "youtu.be/"). Enquanto estiver vazio, a seção mostra
// "Vídeo em breve". `cover` é opcional (ex: "/historia.jpg" em public/);
// sem ele usa a miniatura do próprio YouTube.
export const HISTORY_VIDEO = {
  videoId: "dipEvtXPpqY",
  title: "A história da SB Place",
  duration: "3:51",
  cover: "/historia.webp",
};

// Vídeo do bike fit (arquivo em public/videos/, vertical 9:16).
// Para trocar: substitua o arquivo ou mude o caminho. `poster` é opcional
// (imagem de capa em public/); sem ele usa o primeiro quadro do vídeo.
export const BIKEFIT_VIDEO = {
  src: "/videos/bikefit.mp4",
  poster: "/videos/bikefit-poster.webp",
  title: "Bike fit na SB Place",
  duration: "0:52",
};
