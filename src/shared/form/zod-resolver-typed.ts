import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldValues, Resolver } from 'react-hook-form'
import type { z } from 'zod'

/**
 * Typed bridge for `zodResolver` + Zod 4 + RHF (avoids per-feature `as Resolver<>` noise).
 * `schema` stays a normal Zod object; output type matches your form values type.
 *
 * 使用约定见仓库 `docs/前端代码约定.md` §4 表单。
 */
export function zodResolverTyped<TFieldValues extends FieldValues>(
  schema: z.ZodType<TFieldValues>,
): Resolver<TFieldValues> {
  // Zod 4 schema generics don't line up with @hookform/resolvers overloads; runtime behavior is correct.
  return zodResolver(schema as never) as Resolver<TFieldValues>
}
