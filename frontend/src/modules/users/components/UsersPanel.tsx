import { apiErrorMessage } from '../../../shared/api/api-error';
import { useModal } from '../../../shared/hooks/use-modal';
import { useToast } from '../../../shared/hooks/use-toast';
import { lastAccessLabel } from '../../../shared/utils/format';
import type { UserResponseDto } from '../dto/user-response.dto';
import { usersService } from '../services/users.service';
import { AddUserForm } from './AddUserForm';

interface Props {
  companyId: number;
  licenses: number;
  users: UserResponseDto[];
  onChanged: () => void;
}

export function UsersPanel({ companyId, licenses, users, onChanged }: Props) {
  const { open, info } = useModal();
  const toast = useToast();
  const activeCount = users.filter((u) => u.active).length;

  const addUser = () => {
    if (activeCount >= licenses) {
      info(
        'Todas as vagas estão ocupadas',
        <p>Suspenda uma conta ou ajuste a contratação antes de adicionar outro usuário.</p>,
      );
      return;
    }
    open({ title: 'Adicionar usuário', body: <AddUserForm companyId={companyId} onAdded={onChanged} /> });
  };

  const toggle = async (user: UserResponseDto) => {
    if (!user.active && activeCount >= licenses) {
      toast('Não há vaga disponível para reativação.');
      return;
    }
    try {
      const updated = await usersService.setActive(companyId, user.id, !user.active);
      onChanged();
      toast(updated.active ? 'Usuário reativado na demonstração.' : 'Usuário suspenso na demonstração.');
    } catch (err) {
      toast(apiErrorMessage(err, 'Não foi possível alterar o usuário.'));
    }
  };

  return (
    <div className="panel">
      <div className="row between wrap">
        <div>
          <h2>Usuários da empresa</h2>
          <p className="small muted" style={{ margin: 0 }}>
            Contas individuais, vinculadas às vagas contratadas.
          </p>
        </div>
        <button className="button small" id="add-user" onClick={addUser}>
          + Adicionar usuário
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Situação</th>
              <th>Último acesso</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="users">
            {users.length ? (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <b>{u.name}</b>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={'pill ' + (u.active ? '' : 'gray')}>{u.active ? 'Ativo' : 'Suspenso'}</span>
                  </td>
                  <td>{lastAccessLabel(u.lastAccessAt)}</td>
                  <td>
                    <button className="button secondary small" onClick={() => toggle(u)}>
                      {u.active ? 'Suspender' : 'Reativar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>Nenhum usuário cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
