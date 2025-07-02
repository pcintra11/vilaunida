import type { MetadataRoute } from 'next';
 
// https://www.npmjs.com/package/pwacompat @!!!!!!!!!!!19

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vila Unida',
    short_name: 'VUnida2',
    description: 'Todas as dicas sobre viver em condomínio',
    start_url: '/', //@!!!!!!!!!19
    display: 'standalone',
    background_color: '#ffffff',  // fundo da splash screen
    theme_color: '#0000ff', // barra superior no celular  //@!!!!!!!!!19
    icons: [ // @!!!!!!!!!19 pra que tantas opções??
      // {
      //   src: '/icon-96x96.png', // ícone do app fixado na barra de tarefas (computador)
      //   sizes: '96x96',
      //   type: 'image/png',
      // },
      // {
      //   src: '/icon-192x192.png', // ícone na tela inicial do celular (launcher) E o pequeno ao lado esquerdo da notificação (celular)
      //   sizes: '192x192',
      //   type: 'image/png',
      // },
      {
        src: '/icon-500x500.png',  // splash screen celular  @!!!!!!!!!19 usar com fundo transparente
        sizes: '500x500',
        type: 'image/png',
      },
      // {
      //   src: '/icon-512x512.png', // ícone da notificação grande da mensagem (apenas celular)
      //   sizes: '512x512',
      //   type: 'image/png',
      // },
    ],
  }
}