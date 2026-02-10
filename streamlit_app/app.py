import streamlit as st

st.set_page_config(
    page_title="Climate Data Explorer",
    page_icon="thermometer",
    layout="wide"
)

st.title("Climate Temperature Analysis")
st.markdown("### Explorando 272 anos de dados climaticos globais (1743-2015)")

# Metricas principais
col1, col2, col3, col4 = st.columns(4)
col1.metric("Total de Registros", "10M+")
col2.metric("Periodo", "1743-2015")
col3.metric("Paises", "243")
col4.metric("Cidades", "3,490")

st.markdown("---")
st.markdown("### Navegue pelas paginas no menu lateral para explorar os dados!")