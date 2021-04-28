class Compra{
    constructor(id, descricao, dataCompra, categoria, meioPagamento, parcelas, total) {
        this.id = id;
        this.descricao = descricao;
        this.dataCompra = dataCompra;
        this.categoria = Object.assign({}, categoria);
        this.meioPagamento =  Object.assign({}, meioPagamento);
        this.total = total;
        this.parcelas = [...parcelas];        
    }
}

module.exports = Compra;