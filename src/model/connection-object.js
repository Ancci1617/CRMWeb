const connection_data = {
    host: 'srv815.hstgr.io',
    port : 3306,
    user: 'u970133903_BGMAdmin',
    password: 'RKfwnmPhW1!l',
    database: 'u970133903_BGMDB',
    timezone : "+00:00" //Aca va la hora GMT a la cual esta configurado el servidor
} 

//LOCAL
// const connection_data = {
//     host: 'localhost', //srv815.hstgr.io
//      port: 3306,
//      user: 'root',
//      password: '',
//      database: 'bgm_db',
//      timezone : "+03:00"

// }


//DE PRUEBA
// const connection_data = {
//     host: 'sql815.main-hosting.eu',
//      port: 3306,
//      user: 'u970133903_BGMTest',
//      password: 'h2?Fx3@E',
//      database: 'u970133903_BGMTest'
// }

module.exports = connection_data;
