'use strict';

function SimpleTable() {
    
    this.tableElem = document.createElement('div');
    this.tableElem.className = 'st-Table';
        
    this.addCell= function(cell) {
        let cellElement = document.createElement('div');
        cellElement.className = 'st-TableCell';
        cellElement.innerText = cell.text;
        if(cell.value) {
            cellElement.setAttribute('st-cell-value', cell.value);
        }        
        return cellElement;
    }

    this.addRow = function(cellsArray, style) {

        let row = document.createElement('div');
        row.className = style;

        cellsArray.forEach((cellValue, index) => {
            let cellElement = this.addCell(cellValue);
            cellElement.setAttribute('st-column-num', index);
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

    let spinnerImage = document.createElement('img');
    spinnerImage.src = resourcePath + '/spinner.gif';


    let tableObject = new SimpleTable();
    
    Extension.Element.appendChild(spinnerElement);
        spinnerElement.appendChild(spinnerImage);
    Extension.Element.appendChild(tableHeader);
    Extension.Element.appendChild(viewElement);
        viewElement.appendChild(contentElement);
            contentElement.appendChild(tableObject.tableElem);      

    // Save objects links and settings
    Extension.simpleTableParams = {
            viewElement: viewElement,
            contentElement: contentElement,
            tableElement: tableObject.tableElem,
            tableHeaderElement: tableHeader,
            spinnerElement: spinnerElement,
            tableObject: tableObject,
            viewHeight: 0,
            viewWidth: 0,
            cellsTopOffset: 0,
            cellsBufferCount: 30,
            cellHeight: 30,
            dataRowsCount: 0
        };
    
    // Qv.GetCurrentDocument().GetCurrentSelections({
    //     onChange: function () {

    //         console.log(this.Data.Rows);      
    //     }
    //     });
    
    
    // Bindings
    $(Extension.Element).on("remove", function(event) {        
        console.log(event);
    });
    
    let isScrolling;

    $(viewElement).on('scroll', function() {
            
        $(spinnerElement).show();
        if(isScrolling) {
            window.clearTimeout(isScrolling);
        }        

        // Set a timeout to run after scrolling ends
        isScrolling = setTimeout(function() {
            $(spinnerElement).hide();
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

    let curSlice = Extension.Data.Rows.slice(cellsTopOffset, cellsTopOffset +  tableObjectParams.visibleCellsCount + tableObjectParams.cellsBufferCount);
    if(curSlice.length == 0) {
        tableObjectParams.viewElement.scrollTop = 0;
        return;
    }
    tableObjectParams.tableObject.appendData(curSlice);

    let dataRowsCount = Extension.Data.TotalSize.y;
    if(tableObjectParams.dataRowsCount != dataRowsCount) {
        tableObjectParams.dataRowsCount = dataRowsCount;
        $(tableObjectParams.contentElement).height(tableObjectParams.cellHeight * Extension.Data.TotalSize.y);
    }
        

    $(tableObjectParams.tableHeaderElement).empty();
    tableObjectParams.tableHeaderElement.appendChild(tableObjectParams.tableObject.addHeaderRow(Extension.Data.HeaderRows[0]));
    $(tableObjectParams.tableHeaderElement).width(tableObjectParams.contentElement.clientWidth);

    

    let tableMargin = tableObjectParams.viewElement.scrollTop - tableObjectParams.viewElement.scrollTop % tableObjectParams.cellHeight;
    
    $(tableObjectParams.tableElement).css('transform', 'translate(0, ' + tableMargin + 'px)');

    $(tableObjectParams.tableElement).find('.st-TableCell').on('click', function(event) {
        
        let cell = event.target;
        let colIndex = cell.attributes["st-column-num"].value
        
        //Array.from(cell.parentElement.children).indexOf(cell);

        if(cell.attributes["st-cell-value"]) {
            
            let params = {
                select: cell.attributes["st-cell-value"].value,
                toggle: false
            }
        
            Extension.DocumentMgr.Set(Extension.Name + ".C" + colIndex, params, null);
        }            
    });

    for(let i = 0; i < Extension.Data.Rows[0].length-1; i++) {
        
        let curHeaderCell = $(tableObjectParams.tableHeaderElement).find('div.st-TableCell[st-column-num="'+ i +'"]');
        let curTableCells = $(tableObjectParams.tableElement).find('div.st-TableCell[st-column-num="' + i + '"]');


        curHeaderCell.width(curTableCells.width());

        curTableCells.resizable({           
            handles: 'e',
            alsoResize: curHeaderCell,
            stop: function(){    
                curTableCells.width(Math.min(curTableCells.width(), curHeaderCell.width()));
            }
        });

        curHeaderCell.resizable({           
            handles: 'e',
            alsoResize: curTableCells,
            stop: function(){    
                curHeaderCell.width(Math.min(curTableCells.width(), curHeaderCell.width()));
            }
        });


    }

    
}