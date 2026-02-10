import pandas as pd
from sqlalchemy import create_engine, text
from typing import Literal, Optional
import logging

from src.config import POSTGRES_CONNECTION_STRING, BATCH_SIZE

logger = logging.getLogger(__name__)


class DatabaseLoader:
    """
    Carrega dados no banco de dados.

    Suporta PostgreSQL (e pode ser estendido para outros bancos).
    """

    def __init__(
        self,
        connection_string: Optional[str] = None,
        schema: str = 'climate'
    ):
        """
        Inicializa conexao com o banco.

        Args:
            connection_string: String de conexao. Se nao informada,
                             usa a configuracao padrao.
            schema: Schema do banco onde criar as tabelas.
        """
        self.connection_string = connection_string or POSTGRES_CONNECTION_STRING
        self.schema = schema
        self.engine = create_engine(self.connection_string)

        logger.info(f"Conexao configurada para schema '{schema}'")

    def test_connection(self) -> bool:
        """
        Testa se a conexao esta funcionando.

        Returns:
            True se conectou com sucesso
        """
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Conexao testada com sucesso!")
            return True
        except Exception as e:
            logger.error(f"Erro ao conectar: {e}")
            return False

    def load_dataframe(
        self,
        df: pd.DataFrame,
        table_name: str,
        if_exists: Literal['fail', 'replace', 'append'] = 'append',
        chunk_size: Optional[int] = None
    ) -> int:
        """
        Carrega um DataFrame em uma tabela.

        Args:
            df: DataFrame para carregar
            table_name: Nome da tabela destino
            if_exists: O que fazer se tabela existir
                - 'fail': Erro
                - 'replace': Apaga e recria
                - 'append': Adiciona aos dados existentes
            chunk_size: Tamanho do batch (util para tabelas grandes)

        Returns:
            Numero de linhas carregadas
        """
        chunk_size = chunk_size or BATCH_SIZE

        logger.info(f"Carregando {len(df)} linhas em {self.schema}.{table_name}")

        total_rows = len(df)

        # Para DataFrames grandes, processa em chunks
        if total_rows > chunk_size:
            loaded = 0
            for start in range(0, total_rows, chunk_size):
                end = min(start + chunk_size, total_rows)
                chunk = df.iloc[start:end]

                chunk.to_sql(
                    table_name,
                    self.engine,
                    schema=self.schema,
                    if_exists='append' if start > 0 or if_exists == 'append' else if_exists,
                    index=False,
                    method='multi'
                )

                loaded += len(chunk)
                progress = (loaded / total_rows) * 100
                logger.info(f"Progresso: {loaded}/{total_rows} ({progress:.1f}%)")

        else:
            df.to_sql(
                table_name,
                self.engine,
                schema=self.schema,
                if_exists=if_exists,
                index=False,
                method='multi'
            )

        logger.info(f"Carregamento concluido: {total_rows} linhas")
        return total_rows