const express = require('express')
const app = express()
const port = process.env.PORT || 3000;

app.get('/:name', (req, res) => {
  query = `query {
  user(login: "{req.params.name}") { 
    login
    repositories(first: 1, after: "Y3Vyc29yOnYyOpHOADGiuw==", isFork: false) {
      totalCount

      edges {
        cursor
        node {
          id,

          stargazers(first: 1) {
            totalCount
          }
        }
      }
    }
  }
}`
  res.send({
    id: 3,
    stars: 40,
    login:
  })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
