import React, { FormEvent, useEffect, useState } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { RepositoryResponse } from '../../models/repository.model';
import api from '../../services/api';
import { Error, Form, Repositories, Title } from './styles';

const Dashboard: React.FC = () => {
    const [newRepo, setNewRepo] = useState('');
    const [inputError, setInputError] = useState('');
    const [repositories, setRepositories] = useState<RepositoryResponse[]>(
        () => {
            const storagedRepositories = localStorage.getItem(
                '@GitHubExplorer:repositories',
            );

            if (storagedRepositories) {
                return JSON.parse(storagedRepositories);
            }

            return [];
        },
    );

    useEffect(() => {
        localStorage.setItem(
            '@GitHubExplorer:repositories',
            JSON.stringify(repositories),
        );
    }, [repositories]);

    async function handleAddRepository(
        event: FormEvent<HTMLFormElement>,
    ): Promise<void> {
        event.preventDefault();

        if (!newRepo) {
            setInputError('Digite o autor/nome do respositório.');
            return;
        }

        try {
            const response = await api.get<RepositoryResponse>(
                `repos/${newRepo}`,
            );

            const repository = response.data;

            setRepositories([...repositories, repository]);

            setNewRepo('');
            setInputError('');
        } catch (error) {
            setInputError('Erro na busca por esse respositório.');
        }
    }

    return (
        <>
            <Title>Explore repositórios no GitHub</Title>

            <Form hasError={!!inputError} onSubmit={handleAddRepository}>
                <input
                    value={newRepo}
                    onChange={(e) => setNewRepo(e.target.value)}
                    placeholder="Digite o nome do repositório"
                />
                <button type="submit">Pesquisar</button>
            </Form>

            {inputError && <Error>{inputError}</Error>}

            <Repositories>
                {repositories.map((repository) => (
                    <Link
                        key={repository.full_name}
                        to={`/repositories/${repository.full_name}`}
                    >
                        <img
                            src={repository.owner.avatar_url}
                            alt={repository.owner.login}
                        />
                        <div>
                            <strong>{repository.full_name}</strong>
                            <p>{repository.description}</p>
                        </div>

                        <FiChevronRight size={20} color="#cbcbd6" />
                    </Link>
                ))}
            </Repositories>
        </>
    );
};

export default Dashboard;
