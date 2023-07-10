app to control your linak IDASEN standing desk from ikea based on Nextron (Electron on steroids??)

### Dependencies

nodejs
npm / yarn
bluetooth on your device

### Install Dependencies

```
# after cloning the repo where you'd like
$ cd idasen-kontrol

# using yarn or npm
$ yarn (or `npm install`)
```

### Use it

```
# development mode
$ yarn dev (or `npm run dev` or `pnpm run dev`)

# production build
$ yarn build (or `npm run build` or `pnpm run build`)
```

### TO DO

- initial Desk state & it's actions aren't working until you refresh it in-app or with desk movement
- auto-switch is buggy
- merge long and short movement buttons to work like one button without the jankyness
- custom interval for auto-move switch
- refine selected slot moveTo to be jerk-free at the end when it's creeping for the exact position
- release binaries for linux, mac, win
