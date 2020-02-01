exports.htmlParse = (data, linkDescarrega) => {

    data = data.toString().replace(/{{download_link}}/g, linkDescarrega);
    
    return data;
};