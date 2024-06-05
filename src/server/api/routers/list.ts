import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '~/server/api/trpc';

export const listRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.list.findMany({
      include: {
        items: true,
      },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newList = await ctx.db.list.create({
        data: {
          name: input.name,
        },
      });
      return newList;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deletedList = await ctx.db.list.delete({
        where: { id: input.id },
      });
      return deletedList;
    }),

  addItem: protectedProcedure
    .input(
      z.object({
        listId: z.number(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const newItem = await ctx.db.item.create({
        data: {
          content: input.content,
          listId: input.listId,
        },
      });
      return newItem;
    }),

  removeItem: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const deletedItem = await ctx.db.item.delete({
        where: { id: input.id },
      });
      return deletedItem;
    }),

  moveItem: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        toListId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedItem = await ctx.db.item.update({
        where: { id: input.id },
        data: { listId: input.toListId },
      });
      return updatedItem;
    }),
});