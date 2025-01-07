# Selfie
## Progetto di Tecnologie Web
### Anno Accademico 2023/2024
#### Partecipanti
- Diego Barbieri
- Omar Ayache
- Emanuele Argonni

## Relazione

### Stack
- Frontend: React, Next, TailwindCSS, TypeScript, web-sockets, next-ui
- Backend: Node, Express, websockets
- Database: MongoDB

### Struttura
- `client/`: contiene il codice del frontend
- `server/`: contiene il codice del backend

#### Frontend

Il frontend è stato realizzato con React, Next(ma non abbiamo usato Express per i routing?) per il routing e rendering server-side. Tra le altre librerie utilizzate e' importante citare web-sockets per la comunicazione real-time con il server, e next-ui per la gestione temi dei componenti.

Per l'invio di notifiche lato client e' stato utilizzato il servizio di notifiche integrato nei browser, grazie all'integrazione WPA.

Vorrei dare inoltre credito alla [repo](https://github.com/Siumauricio/nextui-dashboard-template) per aver fornito una buona base per la realizzazione del frontend, in particolare della home page.

#### Backend

Il backend è stato realizzato con Node e Express, con l'aggiunta di websockets per la comunicazione real-time con il frontend. Viene inoltre utilizzato node-mailer, con annesso account google, per la spedizione di notifiche email. 

I web-sockets sono stati utilizzati per:
- chat: messaggi in tempo reale
- notifiche: sistema di notifiche sulla creazione di nuovi eventi/progetti

### Scelte implementative

Nel complesso il progetto cerca di mantenere una struttura pulita e ben organizzata, con un approccio improntato ai componenti e alla modularità. 
Una possibile strada che non abbiamo seguito è stata quella di non usare ts anche per il backend, che avrebbe reso il codice più robusto e manutenibile.

### AI

Alcuni elementi del gruppo hanno fatto uso di Github Copilot, il quale ha aiutato notevolmente nella stesura del codice, specialmente nei primi momenti di sviluppo.

Desideriamo segnalarle che abbiamo utilizzato ChatGPT e/o ClaudeAI per la generazione di alcuni componenti front-end del progetto. Sebbene inizialmente il materiale prodotto da questi strumenti sembrasse di alta qualità e fosse stato creato in tempi rapidi, ci siamo accorti che la sua gestione si è rivelata più complessa del previsto. Questo perché tali tecnologie non considerano sempre una serie di fattori cruciali, rendendo il codice meno facilmente manutenibile e, in alcuni casi, non conforme agli standard richiesti. Di conseguenza, abbiamo appreso che, per ottenere risultati corretti e sostenibili, è necessaria una supervisione attenta e continua del codice generato.
