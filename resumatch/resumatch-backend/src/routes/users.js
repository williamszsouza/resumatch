import { Router } from 'express'
import { requireAuth }  from '../middleware/requireAuth.js'
import { updateUser, softDeleteUser, findUserByUuid } from '../db/userRepository.js'
import { UnauthorizedError, ValidationError } from '../config/errors.js'
import { revokeAllUserRefreshTokens } from '../db/userRepository.js'

export const usersRouter = Router()

// PATCH /api/users/:uuid — atualiza perfil
usersRouter.patch('/:uuid', requireAuth, async (req, res, next) => {
  try {
    console.log(req)
    // Garante que o usuário só pode editar a si mesmo
    if (req.params.uuid !== req.user.uuid) {
      throw new UnauthorizedError('Você não pode editar outro usuário.')
    }

    const allowed = ['name', 'email', 'avatar_url','company_name','role','goal','onboarded']
    const fields  = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) fields[key] = req.body[key]
    }

    if (!Object.keys(fields).length) {
      throw new ValidationError('Nenhum campo válido para atualizar.')
    }

    const updated = await updateUser(req.params.uuid, fields)
    const { password_hash, google_id, ...safe } = updated
    res.json(safe)
  } catch (err) { next(err) }
})

// DELETE /api/users/:uuid — soft delete (LGPD)
usersRouter.delete('/:uuid', requireAuth, async (req, res, next) => {
  try {
    if (req.params.uuid !== req.user.uuid) {
      throw new UnauthorizedError('Você não pode excluir outro usuário.')
    }

    // Revoga todos os tokens antes de deletar
    await revokeAllUserRefreshTokens(req.params.uuid)
    await softDeleteUser(req.params.uuid)

    res.json({ message: 'Conta excluída com sucesso.' })
  } catch (err) { next(err) }
})