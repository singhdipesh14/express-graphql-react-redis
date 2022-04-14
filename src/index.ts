import "reflect-metadata"
import { MikroORM } from "@mikro-orm/core"
import mikroConfig from "./mikro-orm.config"
import express from "express"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { HelloResolver } from "./resolvers/hello"
import { PostResolve } from "./resolvers/post"
import { UserResolver } from "./resolvers/user"
import * as redis from "redis"
import session from "express-session"
import connectRedis from "connect-redis"
import { __prod__ } from "./constants"
import { MyContext } from "./types"
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core"

const main = async () => {
	const orm = await MikroORM.init(mikroConfig)
	orm.getMigrator().up()

	const app = express()

	const RedisStore = connectRedis(session)
	const redisClient = redis.createClient({
		socket: {
			host: "127.0.0.1",
			port: 6379,
		},
	})

	await redisClient.connect()

	app.use(
		session({
			name: "qid",
			store: new RedisStore({
				client: redisClient,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
				httpOnly: true,
				sameSite: "lax", // csrf
				secure: __prod__, // cookie only works in https
			},
			saveUninitialized: false,
			secret: "keyboard cat",
			resave: false,
		})
	)

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolve, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
		plugins: [
			ApolloServerPluginLandingPageGraphQLPlayground({
				settings: {
					"request.credentials": "include",
				},
			}),
		],
	})
	await apolloServer.start()
	apolloServer.applyMiddleware({
		app,
	})
	app.listen(4002, () => {
		console.log("Example app listening on port 4002!")
	})
}
main().catch((err) => console.error(err))
