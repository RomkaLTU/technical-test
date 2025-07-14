import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PlayerType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  teamId!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}
