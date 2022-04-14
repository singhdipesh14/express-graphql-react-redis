import { __user__, __pass__, __prod__ } from "./constants"
import { Post } from "./entities/Post"
import { MikroORM } from "@mikro-orm/core"
import path from "path"
import { User } from "./entities/User"

export default {
	migrations: {
		path: path.join(__dirname, "./migrations"),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	dbName: "lireddit",
	user: __user__,
	password: __pass__,
	debug: !__prod__,
	type: "postgresql",
	entities: [Post, User],
	allowGlobalContext: true,
} as Parameters<typeof MikroORM.init>[0]
