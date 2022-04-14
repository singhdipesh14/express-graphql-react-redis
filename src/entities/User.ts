import { Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/core"
import { Field, Int, ObjectType } from "type-graphql"

@ObjectType()
@Entity()
export class User {
	[OptionalProps]?: "updatedAt" | "createdAt" | "id"
	@Field(() => Int)
	@PrimaryKey()
	id!: number

	@Field()
	@Property({ onUpdate: () => new Date() })
	updatedAt: Date = new Date()

	@Field()
	@Property()
	createdAt: Date = new Date()

	@Field()
	@Property({ type: "text", unique: true })
	username!: string

	@Property({ type: "text" })
	password!: string
}
