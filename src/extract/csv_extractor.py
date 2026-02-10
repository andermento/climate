import pandas as pd
from pathlib import Path
from typing import Dict, Optional, Iterator, Union
import logging

from src.config import RAW_DATA_DIR, CSV_FILES, CHUNK_SIZE

# Configurar logging (registro de mensagens)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CSVExtractor:
    """
    Classe para extrair dados de arquivos CSV.

    Por que usar uma classe?
    - Agrupa funcionalidades relacionadas
    - Facilita reutilizacao e testes
    - Permite manter estado (como o diretorio de dados)

    Uso:
        extractor = CSVExtractor()
        df = extractor.extract("global")  # Extrai dados globais
    """

    def __init__(self, data_dir: Optional[str] = None):
        """
        Inicializa o extrator.

        Args:
            data_dir: Caminho para o diretorio com os CSVs.
                     Se nao informado, usa o padrao da config.
        """
        self.data_dir = Path(data_dir) if data_dir else RAW_DATA_DIR
        self.file_configs = CSV_FILES

        logger.info(f"Extrator inicializado. Diretorio: {self.data_dir}")

    def _get_filepath(self, source: str) -> Path:
        """
        Obtem o caminho completo do arquivo.

        Args:
            source: Nome da fonte ("global", "country", etc.)

        Returns:
            Path do arquivo

        Raises:
            ValueError: Se a fonte nao existe
            FileNotFoundError: Se o arquivo nao existe
        """
        if source not in self.file_configs:
            valid_sources = list(self.file_configs.keys())
            raise ValueError(
                f"Fonte '{source}' nao reconhecida. "
                f"Opcoes validas: {valid_sources}"
            )

        filepath = self.data_dir / self.file_configs[source]["filename"]

        if not filepath.exists():
            raise FileNotFoundError(f"Arquivo nao encontrado: {filepath}")

        return filepath

    def extract(
        self,
        source: str,
        chunksize: Optional[int] = None
    ) -> Union[pd.DataFrame, Iterator[pd.DataFrame]]:
        """
        Extrai dados de um arquivo CSV.

        Args:
            source: Nome da fonte ("global", "country", "state",
                   "major_city", "city")
            chunksize: Se informado, retorna um iterator que le
                      o arquivo em pedacos desse tamanho.
                      Util para arquivos grandes!

        Returns:
            DataFrame com os dados, ou Iterator se chunksize informado

        Exemplo:
            # Ler arquivo pequeno de uma vez
            df = extractor.extract("global")

            # Ler arquivo grande em chunks
            for chunk in extractor.extract("city", chunksize=500000):
                process(chunk)
        """
        filepath = self._get_filepath(source)

        logger.info(f"Extraindo dados de: {filepath.name}")

        # Configuracoes de leitura
        read_params = {
            "filepath_or_buffer": filepath,
            "na_values": [""],      # Celulas vazias = NaN
            "parse_dates": ["dt"],  # Converte coluna 'dt' para datetime
            "low_memory": False,    # Evita warnings de tipos mistos
        }

        # Adiciona chunksize se informado
        if chunksize:
            read_params["chunksize"] = chunksize
            logger.info(f"Lendo em chunks de {chunksize} linhas")

        df = pd.read_csv(**read_params)

        if not chunksize:
            logger.info(f"Extraidos {len(df)} registros de {source}")

        return df

    def extract_all_small(self) -> Dict[str, pd.DataFrame]:
        """
        Extrai todos os arquivos pequenos (tudo exceto 'city').

        Returns:
            Dicionario {nome_fonte: DataFrame}
        """
        results = {}
        small_sources = ["global", "country", "state", "major_city"]

        for source in small_sources:
            results[source] = self.extract(source)

        return results

    def get_file_info(self, source: str) -> Dict:
        """
        Retorna informacoes sobre um arquivo.

        Util para saber o tamanho antes de processar.
        """
        filepath = self._get_filepath(source)
        config = self.file_configs[source]

        # Conta linhas sem carregar tudo na memoria
        with open(filepath, 'r') as f:
            line_count = sum(1 for _ in f) - 1  # -1 pelo header

        return {
            "source": source,
            "filename": config["filename"],
            "description": config["description"],
            "filepath": str(filepath),
            "actual_rows": line_count,
            "file_size_mb": filepath.stat().st_size / (1024 * 1024),
        }

    def preview(self, source: str, rows: int = 5) -> pd.DataFrame:
        """
        Retorna uma previa dos dados (primeiras linhas).

        Util para verificar a estrutura sem carregar tudo.
        """
        filepath = self._get_filepath(source)
        return pd.read_csv(filepath, nrows=rows)