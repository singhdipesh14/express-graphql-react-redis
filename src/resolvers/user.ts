import { User } from "../entities/User"
import { MyContext } from "../types"
import {
	Arg,
	Ctx,
	Field,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from "type-graphql"
import argon2 from "argon2"

@ObjectType()
class FieldError {
	@Field()
	field!: string

	@Field()
	message!: string
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[]

	@Field(() => User, { nullable: true })
	user?: User
}

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	async me(@Ctx() ctx: MyContext) {
		const userId = ctx.req.session.userId
		if (!userId) {
			return null
		}
		const user = await ctx.em.findOne(User, { id: userId })
		return user
	}
	@Mutation(() => UserResponse)
	async register(
		@Arg("username") username: string,
		@Arg("password") password: string,
		@Ctx() ctx: MyContext
	): Promise<UserResponse> {
		if (username.length <= 2) {
			return {
				errors: [{ field: "username", message: "length must be greater than 2" }],
			}
		}
		const userExists = await ctx.em.findOne(User, { username })
		if (userExists) {
			return {
				errors: [{ field: "username", message: "username already taken" }],
			}
		}
		const hashedPassword = await argon2.hash(password)
		const user = ctx.em
			.fork({})
			.create(User, { username, password: hashedPassword })
		await ctx.em.persistAndFlush(user)
		return { user }
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("username") username: string,
		@Arg("password") password: string,
		@Ctx() { em, req }: MyContext
	): Promise<UserResponse> {
		const user = await em.findOne(User, { username })
		if (!user) {
			return {
				errors: [{ field: "username", message: "that username doesn't exist" }],
			}
		}
		const valid = await argon2.verify(user.password, password)
		if (!valid) {
			return {
				errors: [{ field: "password", message: "incorrect password" }],
			}
		}

		req.session.userId = user.id

		return { user }
	}
}
