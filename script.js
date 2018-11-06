"use strict";
// путь к дополнительным ресурсам
var resourcePath = Qva.Remote + (Qva.Remote.indexOf('?') >= 0 ? '&' : '?') + 'public=only' + '&name=Extensions/Simple table';
// загружаем таблицу стилей
Qva.LoadCSS(resourcePath + '/style.css');
$.getScript(resourcePath + '/Simple table.js', () => {

    Qva.AddExtension("Simple table", function() {
        try {
                
            console.log('Repainting started');
            //console.log(this);
            let Extension =  this;

            let tableObjectParams = Extension.simpleTableParams ? Extension.simpleTableParams: null;           
            
            if(!tableObjectParams) {

                simpleTableInit(Extension);
                return;
            }

            console.log('Drawing');
           
            updateTableContents(Extension);
            
        }
        catch(e) {
            console.error(e);
        }   
     
    }, true)
});









