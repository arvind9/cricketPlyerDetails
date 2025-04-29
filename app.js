const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const databasePath = path.join(__dirname, 'cricketMatchDetails.db')

let database = null

const intializeDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

intializeDBAndServer()

// API - 1 GET METHOD FROM /players/
app.get('/players/', async (request, response) => {
  const listOfAllPlayersQuery = `
    SELECT 
        player_id as playerId, player_name as playerName 
    FROM 
        player_details`
  const allPlayers = await database.all(listOfAllPlayersQuery)
  response.send(allPlayers)
})

// API - 2
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getRequestedPlayerQuery = `
  SELECT 
      player_id as playerId, player_name as playerName 
  FROM 
      player_details
  WHERE 
      player_id=${playerId}`
  const player = await database.get(getRequestedPlayerQuery)
  response.send(player)
})

// API -3 PUT METHOD
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName} = request.body
  const editPlayerQuery = `
  UPDATE 
      player_details 
  SET 
      player_name='${playerName}'
  WHERE 
      player_id=${playerId}`
  await database.run(editPlayerQuery)
  response.send('Player Details Updated')
})
