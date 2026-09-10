# Camera Monitor

Central de monitoramento de DVR, NVR e câmeras IP, com interface PWA para PC e celular e Companion local para conectividade e vídeo.

## O que já está pronto

- Cadastro de dispositivos
- Busca e ordenação
- Status e teste TCP de conectividade
- Painel 1 / 4 / 9 / 16 câmeras
- Tela cheia
- PWA instalável
- Companion local em `127.0.0.1:8787`
- Ponte RTSP → HLS local usando FFmpeg
- Credenciais/URL RTSP fora do código público

## Arquitetura

`Câmera/DVR/NVR → RTSP → Companion local → HLS → Camera Monitor`

O navegador não reproduz RTSP diretamente. Por isso o Companion faz a adaptação no próprio computador.

## Instalação do Companion

Requisitos: Node.js 18+ e FFmpeg no PATH.

No Windows, entre em `companion` e execute `start-companion.bat`.

Depois abra o Camera Monitor e mantenha o indicador **Serviço local online**.

## Uso responsável

Use o sistema apenas em dispositivos e redes que você administra ou para os quais possui autorização.
