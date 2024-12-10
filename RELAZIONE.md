# Selfie
## Progetto di Tecnologie Web
### Anno Accademico 2023/2024
#### Partecipanti
- Diego Barbieri
- Omar Ayache
- Emanuele Argonni

## Relazione

### Stack
- Frontend: React, Next, TailwindCSS, TypeScript, websockets, next-ui
- Backend: Node, Express, websockets
- Database: MongoDB

### Struttura
- `client/`: contiene il codice del frontend
- `server/`: contiene il codice del backend

#### Frontend

Il frontend è stato realizzato con React, Next per il routing e rendering server-side. Tra le altre librerie utilizzate e' importante citare websockets per la comunicazione real-time con il server, e next-ui per la gestione temi dei componenti.

Per l'invio di notifiche lato client e' stato utilizzato il servizio di notifiche integrato nei browser, grazie all'integrazione WPA.

Vorrei dare inoltre credito alla [repo](https://github.com/Siumauricio/nextui-dashboard-template) per aver fornito una buona base per la realizzazione del frontend, in particolare della home page.

#### Backend

Il backend è stato realizzato con Node e Express, con l'aggiunta di websockets per la comunicazione real-time con il frontend. Viene inoltre utilizzato node-mailer, con annesso account google, per la spedizione di notifiche email. 

I web sockets sono stati utilizzati per:
- chat: messaggi in tempo reale
- notifiche: sistema di notifiche sulla creazione di nuovi eventi/progetti

### Scelte implementative

Nel complesso il progetto cerca di mantenere una struttura pulita e ben organizzata, con un approccio improntato ai componenti e alla modularità. Una delle peggiori scelte e' stata quella di non adoperare ts anche per il backend, che avrebbe reso il codice più robusto e manutenibile.

### AI

Il progetto e' stato realizzato utilizzando Github Copilot come strumento di LLM, che ha aiutato notevolmente nella stesura del codice, specialmente nei primi momenti di sviluppo.

Pensiamo sia degno di nota segnalare che e' stato utilizzato anche chatgpt e/o claudai per la generazione di alcuni componenti front-end: quello che sembrava un ottimo e veloce lavoro, e' risultato essere un disastro, in quanto questo genere di tecnologie non tiene in considerazione delle librerie utilizzate, non e' in grado di generare condice mantenibile.
