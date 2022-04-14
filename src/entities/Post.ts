import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core"
import { Field, Int, ObjectType } from "type-graphql"

@ObjectType()
@Entity()
export class Post {
	[OptionalProps]?: "updatedAt" | "createdAt" | "id"
	@Field(() => Int)
	@PrimaryKey()
	id!: number

	@Field(() => String)
	@Property({ type: "text" })
	title!: string

	@Field()
	@Property({ onUpdate: () => new Date() })
	updatedAt: Date = new Date()

	@Field()
	@Property()
	createdAt: Date = new Date()
}
