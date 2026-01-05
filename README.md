# Rainwave automation extension

A browser extension for [rainwave.cc](https://rainwave.cc) to automate:
- Voting
- Requests

### Automatic song voting
Set up your desired rules that will run when the song changes. You need to be tuned in 1st.


### Automatic song requests
Enable/Disable the options that will run when the song changes. You need to be logged in and tuned in 1st.
- Request favorites
- Request unrated
- Delete requests on cooldown


## Building from source

Requirements:
- [Node v24](https://nodejs.org/en/download)
- [pnpm](https://pnpm.io/installation)

Build:
1. `pnpm install`
2. Chrome: `pnpm run zip`<br/>
   Firefox: `pnpm run zip:firefox`
3. Extension .zip files are in `.output` directory