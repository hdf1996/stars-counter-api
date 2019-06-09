require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 3000;
const graphql = require('@octokit/graphql')
const accessToken = process.env.ACCESS_TOKEN;

const query = async (login, from, acc) => {
  const result = await graphql(`query ($login: String!, $from: String){
                                        user(login: $login) {
                                          login
                                          avatarUrl
                                          repositories(first: 10, after: $from, isFork: false) {
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
                                      }`, {
    login: login,
    from: from,
    headers: {
      authorization: `token ${accessToken}`
    }
  })
  acc = [...acc, ...result.user.repositories.edges.map(({node, cursor}) => [cursor, node.stargazers.totalCount])];
  if (result.user.repositories.totalCount > acc.length) {
    return query(login, acc[acc.length - 1][0], acc);
  } else {
    return [acc, result.user.avatarUrl];
  }
}

app.get('/stars/:login', async (req, res) => {
  console.log(`Requesting count for ${req.params.login}`)
  try {
    const result = await query(req.params.login, null, []);
    res.send({
      avatar: result[1],
      total: result[0].reduce((a, b) => a + b[1], 0)
    })
  } catch (e) {
    if (e.errors[0].type === 'NOT_FOUND') {
      res.status(404).send({error: 'User not found'})
    } else {
      res.status(500).send({error: 'Unknown error found'})
    }
  }
})

app.listen(port, () => console.log(`Stars count app listening on port ${port}!`))
