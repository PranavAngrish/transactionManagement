const axios = require("axios");
const { BASE_CURRENCY, EXCHANGE_API_URL } = require("../config/constants");

async function convertINR(amount, currency){
    if(currency == BASE_CURRENCY) return amount;
    try{
        const response = await axios.get(EXCHANGE_API_URL)
        const data = response.data;

        if(!data.rates || !data.rates[currency]){
            throw new Error("Unsupported Currency");
        }

        return amount * data.rates[currency];
    }
    catch(err){
        throw new Error(`Currency conversion failed : ${err.message}`);
    }
}

module.exports = {convertINR};