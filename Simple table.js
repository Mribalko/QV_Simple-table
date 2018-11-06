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

        let columnWidth = 100 / cellsArray.length;

        cellsArray.forEach(cell => {
            
            let cellElement = this.addCell(cell.text);
            $(cellElement).width(columnWidth + '%');
            row.appendChild(cellElement);
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

    $(Extension.Element).empty();

    // DOM elements creation
    let viewElement = document.createElement('div');
    viewElement.className = 'st-view';
    
    let contentElement = document.createElement('div');
    contentElement.className = 'st-content';

    let tableHeader = document.createElement('div');
    tableHeader.className = 'st-Table';

    let spinnerElement = document.createElement('div');
    spinnerElement.className = 'st-Spinner';


    let tableObject = new SimpleTable();
    
    Extension.Element.appendChild(spinnerElement);
    Extension.Element.appendChild(tableHeader);
    Extension.Element.appendChild(viewElement);
        viewElement.appendChild(contentElement);
            contentElement.appendChild(tableObject.tableElem);    
    
    //let cellHeight = $('.st-TableCell').outerHeight();
   

    // Save objects links and settings
    Extension.simpleTableParams = {
            viewElement: viewElement,
            contentElement: contentElement,
            tableElement: tableObject.tableElem,
            tableHeaderElement: tableHeader,
            tableObject: tableObject,
            viewHeight: 0,
            viewWidth: 0,
            cellsTopOffset: 0,
            cellsBufferCount: 30,
            cellHeight: 30,
            dataRowsCount: 0
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

    let viewHeight = tableObjectParams.viewElement.clientHeight;  
    if(tableObjectParams.viewHeight != viewHeight) {
        tableObjectParams.viewHeight = viewHeight;
        tableObjectParams.visibleCellsCount = Math.round(tableObjectParams.viewElement.clientHeight / tableObjectParams.cellHeight);
    }

    let viewWidth = tableObjectParams.viewElement.clientWidth;
    if(tableObjectParams.viewWidth != viewWidth) {
        tableObjectParams.viewWidth = viewWidth;
        $(tableObjectParams.tableHeaderElement).width(tableObjectParams.contentElement.clientWidth);
    }

    let dataRowsCount = Extension.Data.TotalSize.y;
    if(tableObjectParams.dataRowsCount != dataRowsCount) {
        tableObjectParams.dataRowsCount = dataRowsCount;
        $(tableObjectParams.contentElement).height(tableObjectParams.cellHeight * Extension.Data.TotalSize.y);
    }
        

    $(tableObjectParams.tableHeaderElement).empty();
    tableObjectParams.tableHeaderElement.appendChild(tableObjectParams.tableObject.addHeaderRow(Extension.Data.HeaderRows[0]));

    let curSlice = Extension.Data.Rows.slice(cellsTopOffset, cellsTopOffset +  tableObjectParams.visibleCellsCount + tableObjectParams.cellsBufferCount);
    if(curSlice.length == 0) {
        tableObjectParams.viewElement.scrollTop = 0;
        return;
    }
    tableObjectParams.tableObject.appendData(curSlice);

    let tableMargin = tableObjectParams.viewElement.scrollTop - tableObjectParams.viewElement.scrollTop % tableObjectParams.cellHeight;
    $(tableObjectParams.tableElement).css('transform', 'translate(0, ' + tableMargin + 'px)');
    
    
}