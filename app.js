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

// API - 4 GET
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getRequestedMatchQuery = `
  SELECT 
      match_id as matchId, match, year  
  FROM 
      match_details
  WHERE 
      match_id=${matchId}`
  const match = await database.get(getRequestedMatchQuery)
  response.send(match)
})

// API - 5 GET
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const matchDetailsQuery = `
  SELECT 
    match_details.match_id as matchId, match_details.match, match_details.year 
  FROM 
    player_match_score JOIN match_details ON match_details.match_id=player_match_score.match_id 
  WHERE 
    player_match_score.player_id=${playerId}`
  const matches = await database.all(matchDetailsQuery)
  response.send(matches)
})

// API - 6
app.get('/matches/:matchId/players/', async (request, response) => {
  const {matchId} = request.params
  const playerMatchDetailsQuery = `
  SELECT 
    player_details.player_id as playerId, player_details.player_name as playerName 
  FROM 
    player_match_score JOIN player_details ON player_details.player_id=player_match_score.player_id 
  WHERE 
    player_match_score.match_id=${matchId}`
  const matches = await database.all(playerMatchDetailsQuery)
  response.send(matches)
})

// API - 7 GET
app.get('/players/:playerId/playerScores/', async (request, response) => {
  const {playerId} = request.params
  const totalScoreOfPlayerQuery = `
  SELECT 
    player_details.player_id as playerId, player_details.player_name as playerName, 
      SUM(player_match_score.score) as totalScore, 
      SUM(player_match_score.fours) as totalFours,
      SUM(player_match_score.sixes) as totalSixes
  FROM 
    player_match_score JOIN player_details ON player_details.player_id=player_match_score.player_id 
  WHERE 
    player_match_score.player_id=${playerId}`
  const totalScore = await database.all(totalScoreOfPlayerQuery)
  response.send(...totalScore)
})

module.exports = app