'use strict';

function SimpleTable() {
    
    this.tableElem = document.createElement('div');
    this.tableElem.className = 'st-Table';
        
    this.addCell= function(value) {
        let cell = document.createElement('div');
        cell.className = 'st-TableCell';
        cell.innerText = value;
        return cell;
    }

    this.addRow = function(cellsArray, style) {

        let row = document.createElement('div');
        row.className = style;

        cellsArray.forEach(cell => {
            row.appendChild(this.addCell(cell.text));
        });

        return row;
    }

    this.addHeaderRow = function(cellsArray) {
        return this.addRow(cellsArray, 'st-TableHeadRow');
    }

    this.addTableRow = function(cellsArray) {
        return this.addRow(cellsArray, 'st-TableRow');
    }

    this.appendData = function(dataArray) {
        
        $(this.tableElem).empty();

        dataArray.forEach(row => {
            this.tableElem.appendChild(this.addTableRow(row));
        })

        return this.tableElem;
    }
    
}

function simpleTableInit(Extension) {
    console.log('init');

    // DOM elements creation
    let viewElement = document.createElement('div');
    viewElement.className = 'st-view';
    
    let contentElement = document.createElement('div');
    contentElement.className = 'st-content';

    let tableHeader = document.createElement('div');
    tableHeader.className = 'st-Table';


    let tableObject = new SimpleTable();
 
    Extension.Element.appendChild(tableHeader);
        tableHeader.appendChild(tableObject.addHeaderRow(Extension.Data.HeaderRows[0]));
    Extension.Element.appendChild(viewElement);
        viewElement.appendChild(contentElement);
            contentElement.appendChild(tableObject.tableElem);    
    

    // Save objects links
    Extension.simpleTableParams = {
            viewElement: viewElement,
            contentElement: contentElement,
            tableElement: tableObject.tableElem,
            tableHeaderElement: tableHeader,
            tableObject: tableObject,
            viewHeight: viewElement.clientHeight,
            viewWidth: viewElement.viewWidth,
            cellsTopOffset: 0,
            cellsBufferCount: 30
        };
    
    
    
    // Bindings
    $(tableObject.tableElem).bind('click', function() {
    
        console.log('click fired!');
        Extension.ObjectMgr.PartialLoad(Extension.Name, {x: 0, y: 204});
        console.log(Extension);          
    });

    let isScrolling;


    $(viewElement).bind('scroll', function() {
            
        if(isScrolling) {
            window.clearTimeout( isScrolling );
        }        

        // Set a timeout to run after scrolling ends
        isScrolling = setTimeout(function() {

            updateTableContents(Extension);

        }, 200);
        
    })

    // reload extension. Call paint()
    //Extension.ObjectMgr.PageBinder.QueuePostPaintMessage(Extension.PageBinder);

    Extension.Data.SetPagesizeY(60);

}

function updateTableContents(Extension) {

    let tableObjectParams = Extension.simpleTableParams;

    let cellsTopOffset = Math.floor(tableObjectParams.viewElement.scrollTop / tableObjectParams.cellHeight);
    
    if(tableObjectParams.cellsTopOffset != cellsTopOffset) {
        tableObjectParams.cellsTopOffset = cellsTopOffset;
        Extension.ObjectMgr.PartialLoad(Extension.Name, {x: 0, y: cellsTopOffset});
        return;
    }

    let visibleCellsCount = Math.round(tableObjectParams.viewElement.clientHeight / tableObjectParams.cellHeight);
    //console.log(Extension.Data.Rows.slice());
    let curSlice = Extension.Data.Rows.slice(cellsTopOffset, cellsTopOffset + visibleCellsCount + tableObjectParams.cellsBufferCount);
    let tableMargin = tableObjectParams.viewElement.scrollTop - tableObjectParams.viewElement.scrollTop % tableObjectParams.cellHeight;
    $(tableObjectParams.tableElement).css('transform', 'translate(0, ' + tableMargin + 'px)');
    $(tableObjectParams.tableHeaderElement).width(tableObjectParams.contentElement.clientWidth);
    tableObjectParams.tableObject.appendData(curSlice);
}