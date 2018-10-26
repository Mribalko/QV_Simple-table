"use strict";
// путь к дополнительным ресурсам
var resourcePath = Qva.Remote + (Qva.Remote.indexOf('?') >= 0 ? '&' : '?') + 'public=only' + '&name=Extensions/Simple table';
// загружаем таблицу стилей
Qva.LoadCSS(resourcePath + '/style.css');
$.getScript(resourcePath + '/Simple table.js', () => {

    Qva.AddExtension("Simple table", function() {
        try {
                
            console.log('Repainting started')
            let Extension =  this;

            let tableObjectParams = Extension.simpleTableParams ? Extension.simpleTableParams: null;
            
            if(!tableObjectParams) {
                simpleTableInit(Extension);
                return;
            }

            console.log('Drawing');
            tableObjectParams.cellHeight = 30; //$('.st-TableCell').outerHeight();
            $(tableObjectParams.contentElement).height(tableObjectParams.cellHeight * Extension.Data.TotalSize.y);

            
            let viewHeight = tableObjectParams.viewElement.clientHeight;
            let viewWidth = tableObjectParams.viewElement.clientWidth;

            if(tableObjectParams.viewHeight != viewHeight || tableObjectParams.viewWidth != viewWidth) {
                tableObjectParams.viewHeight = viewHeight;
                tableObjectParams.viewWidth = viewWidth;
                tableObjectParams.viewElement.scrollTop = 0;
            }

            updateTableContents(Extension);
            
        }
        catch(e) {
            console.error(e);
        }   
     
    }, true)
});









