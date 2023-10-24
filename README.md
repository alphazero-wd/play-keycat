# Keycat

## Description

Keycat is a league-based typing game i.e. similar to Typeracer, but with League integrated.

- I was inspired by League of Legends and Typeracer, thus I thought of building a hybrid version of both games.
- The reason for building the project was to learn how WebSockets and socket.io are used in real-time client-server communication.
- I reckon that by playing a league-based typing game, people will be eager to practice and get better at typing, while still having an enjoyable experience like when they play League of Legends.
- I learnt how to set up a WebSockets connection between the client and the server, how WS can be used in such an application, and how authorization works with WS.

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Features to be added](#features-to-be-added)
4. [License](#license)

## Installation

### Clone the repository

```bash
git clone https://github.com/alphazero-wd/play-keycat.git
cd play-keycat
```

### Server installation

Create a `.env` file and include these variables in the file:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/keycat?schema=public"
SESSION_SECRET="s3cr3t"
REDIS_URL="redis://default:redis@localhost:6379/1"
CORS_ORIGIN="http://localhost:3000"
```

```bash
cd server/
yarn
docker compose up -d
yarn prisma migrate deploy
yarn start
```

### Client installation

Include the following in the `.env.local` file:

```bash
NEXT_PUBLIC_API_URL="http://localhost:5000"
```

```bash
cd client/
yarn
yarn start
```

Open up your browser and go to http://localhost:3000.

## Usage

In the browser, you'll be welcomed with a login page:

![Login page](./assets/login.png)

Create a new account if you haven't got one.

![Signup page](./assets/signup.png)

After logging in or signing up, you'll be at the home page

![Home page](./assets/home.png)

Click on the _"Join game"_ button to start your first league game. However, a game requires 3 players in order to start, so you'll see a message _"Waiting for opponents..."_.

![Game waiting state](./assets/game_waiting.png)

Other players **of a similar level** may arbitrarily join in the game that you're in until there are exactly 3 players. After which, there will be a 10-second countdown before the game actually starts.

![Game countdown state](./assets/game_countdown.png)

Once the countdown is over, the game has officially started, typists will compete against one another by finish typing the given text as soon as possible before time runs out.

![Game playing state](./assets/game_playing.png)

If the player makes a typo, they are forced to correct it before being able to type the next character.

![Player making a typo](./assets/game_playing_typos.png)

Either when the time is up or the player finishes typing the given text, here's what will be displayed.

![When game ends](./assets/game_finished.png)

## Features to be added

- Use Keycat Points (KCPs) for measuring skills (similar to League Points (LPs) in League of Legends).
- Determine the rank of a player based on the KCPs they've obtained.
- Add clubs so players in a club can compete against another club.
- Allow players to friend, chat other players.
- Introduce practice mode, invite-only mode.
- Introduce XPs and levels, icons, skins and more.

## License

Apache-2.0 license [@alphazero-wd](https://github.com/alphazero-wd)
