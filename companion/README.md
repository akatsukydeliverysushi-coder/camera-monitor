# Camera Monitor Companion

Serviço local do Camera Monitor para testar conectividade e fazer a ponte de vídeo RTSP para HLS.

## Requisitos

- Windows, Linux ou macOS
- Node.js 18+
- FFmpeg instalado e disponível no PATH para vídeo RTSP → HLS

## Iniciar no Windows

1. Abra a pasta `companion`.
2. Execute `start-companion.bat` ou `npm start`.
3. Deixe a janela aberta enquanto o Camera Monitor estiver sendo usado.
4. No aplicativo, o endereço padrão é `http://127.0.0.1:8787`.

## Teste rápido

Abra `http://127.0.0.1:8787/api/health` no navegador. Se o serviço estiver funcionando, aparecerá um JSON informando `Camera Monitor Companion`.

## Vídeo real

O aplicativo envia a URL RTSP somente para o Companion local. A URL RTSP não é salva no `localStorage` pelo painel. O Companion inicia o FFmpeg localmente e publica a playlist HLS somente em `127.0.0.1`.

O navegador usa HLS.js para reproduzir o vídeo em navegadores que não oferecem HLS nativo.

## Segurança

- O serviço escuta somente em `127.0.0.1`.
- Credenciais não são colocadas no código público.
- O painel não persiste a URL RTSP.
- O Companion não executa tentativas automáticas de login além da conexão RTSP solicitada pelo usuário.
- Use somente câmeras e redes que você administra ou para as quais tenha autorização.
