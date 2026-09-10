# Camera Monitor Companion

Serviço local para o Camera Monitor. Ele permite que o navegador peça ao PC um teste TCP de conectividade até um dispositivo da rede autorizada.

## Requisitos

- Windows, Linux ou macOS
- Node.js 18 ou superior

## Iniciar no Windows

Abra o Prompt de Comando dentro desta pasta e execute:

```text
npm start
```

O serviço ficará em `http://127.0.0.1:8787`.

No Camera Monitor, em **Configurações**, mantenha esse endereço como Companion.

## Segurança

- O serviço escuta somente em `127.0.0.1`.
- Não recebe nem armazena senhas de câmeras.
- Não executa tentativas de login.
- O teste verifica apenas se o host/porta TCP informado está acessível.
- Use somente em redes e dispositivos que você administra ou tem autorização para testar.

## Próxima camada

A arquitetura está preparada para acrescentar uma ponte local ONVIF/RTSP → HLS/WebRTC, mantendo as credenciais fora do código público e permitindo vídeo real no navegador.
