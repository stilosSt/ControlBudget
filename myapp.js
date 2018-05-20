//BUDGET CONTROLLER
var budgetController = (function(){
    
    var Income = function(id,descr,val){

        this.id = id;
        this.descr = descr;
        this.val = val;

    };

    var Expense = function(id,descr,val){

        this.id = id;
        this.descr = descr;
        this.val = val;
        this.percentage = -1;

    };


    Expense.prototype.calcPercentage = function(totalIncome){

        if(totalIncome > 0){
        
            this.percentage = Math.round((this.val / totalIncome) * 100);
        }
        else{

            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function(){

        return this.percentage;
    }

    var data = {

        allItems : {

            exp : [],
            inc : []

        },
        totals : {

            exp : 0,
            inc : 0

        },
        
        budget : 0 ,
        percentage : -1

    }

    var calculateTotal = function(type){

        var sum = 0;
        data.allItems[type].forEach(function(cur){

            sum += cur.val;

        });

        data.totals[type] = sum;

    }

    return{

        addItem : function(type,desc,vl){

            var newItem,ID;

            //Create new ID
            if(data.allItems[type].length > 0){

                ID = data.allItems[type][data.allItems[type].length - 1 ].id + 1; // e.g. data.allItems.exp[4].id + 1 
                //allItems is an object and for those reason we use the []
                //WARNING!! (data.allItems[type].length).id - 1 ---> 4.id - 1
            }
            else{

                ID = 0;
            }

            //Creating new inc/exp Object
            if(type === 'inc') {

                newItem = new Income(ID,desc,vl);

            } else if(type === 'exp') {

                newItem = new Expense(ID,desc,vl);

            }

            //Add object to its array
            data.allItems[type].push(newItem);

            //Return item
            return newItem;
        },

        deleteItem : function(type,id){

            var ids,index;

            //id = 6
            //data.allItems[type][id]
            //ids = [1 2 4 6 8]
            //index = 3

            ids = data.allItems[type].map(function(current){

                return current.id; 

            });

            index = ids.indexOf(id);


            if(index !== -1){

                data.allItems[type].splice(index,1);

            }
        },

        calculateBudget : function(){

            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of income that we spent
            if(data.totals.inc > data.totals.exp){

                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

            }else{
                data.percentage = -1;
            }
        },

        calculatePercentages : function(){

            data.allItems.exp.forEach(function(curr){

                curr.calcPercentage(data.totals.inc);

            });

        },

        getBudget : function(){

            return {

                budget : data.budget,
                income : data.totals.inc,
                expense : data.totals.exp,
                percentage : data.percentage

            }


        },

        getPercentages : function(){

            var allPerc = data.allItems.exp.map(function(curr){

                return curr.getPercentage();
                //return curr.percentage;
            });

            return allPerc;

        },

        testing : function(){

            console.log(data);
        }

    }

})();
    

//UI CONTROLLER
var UIController = (function(){

    var DOMstrings = {
        
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensesPercLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
      

    };

    var formatNumber = function(num,type){
        
        /*

        + or - before number
        exactly 2 decimal points
        comma separating the thousands

        2310.4567 -> + 2,310.46
        2000 -> 2,000.00
        */


        var numSplit,int,dec;

        num = Math.abs(num);
        num = num.toFixed(2); // 2.4567.toFixed(2) --> "2.46" 

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3 ){

            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length-3,3); //for input 2310 --> 2,310

        }

        dec = numSplit[1];

        // type === 'exp' ? sign = '-' : sign = '+';

        // return type + ' ' + int + dec;

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    }

    var nodeListForEach = function(list,callback){
        
        for(var i = 0; i < list.length; i++){
            callback(list[i],i);
        }

    }          

    return {

        getInput : function(){

            // var type = document.querySelector('.add__type').value; // inc or exp
            // var description = document.querySelector('.add__description').value;
            // var value = document.querySelector('.add__value').value;

            //we want to return theses variables and the best way is to return them as an object
            return { 
                
                type : document.querySelector(DOMstrings.inputType).value, // inc or exp
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)

            }

        },

        addListItem : function(obj,type){

            var html,newHTML,element;

            //Create HTML string with placeholder text
            if(type === 'inc'){

                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            
            }
            else if(type === 'exp'){

                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            
            }
            
            //Replace the placeholder text with some actual data
            
            newHTML = html.replace('%id%',obj.id);
            newHTML = newHTML.replace('%description%',obj.descr);
            newHTML = newHTML.replace('%value%',formatNumber(obj.val,type));

            //Insert HTML into the DOM

            document.querySelector(element).insertAdjacentHTML('beforeend',newHTML);

        },

        clearFields : function(){

            var fields,fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            //!!!!!!! converting the list that returns us the querySelectorAll to an array 
            fieldsArr = Array.prototype.slice.call(fields); 

            fieldsArr.forEach(function(current){

                current.value = "" ;

            });

            fieldsArr[0].focus();
        },

        displayBudget : function(obj){

            var type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.income,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.expense,'exp');
            if(obj.percentage > 0 ){

                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";

            }
            else{

                document.querySelector(DOMstrings.percentageLabel).textContent = "---";

            }
        },

        displayPercentages : function(percentages){

            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            // console.log(fields);
            nodeListForEach(fields,function(curr,index){
                // console.log(curr + " " + index);
                if(percentages[index] > 0 ){
                    curr.textContent = percentages[index] + '%';
                } 
                else{
                    curr.textContent = "---";
                }
            });
        },
    
        deleteListItem : function(selectorID){

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);

        },

        displayMonth : function(){

            var now,year,months,month,day;
            now = new Date();

            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            //day = now.getDay()
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;

        },

        changeType : function(){

            var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            nodeListForEach(fields,function(cur){

                cur.classList.toggle('red-focus');

            });


        },

        getDOMstrings : function(){

            return DOMstrings;
        }
    }

})();
    

//APP CONTROLLER - The module where we tell to the other modules what to do
var controller = (function(bgC,UiC){

    function setupEventListeners(){

        var DOM = UiC.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem); //if we had a function expr after the call then it would be nothing

        document.addEventListener('keypress',function(event){

            if(event.keyCode === 13 || event.which === 13){
                
                ctrlAddItem();
            }

        });

        document.querySelector(DOM.inputType).addEventListener('click',UiC.changeType);

        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
    }
    

    function ctrlAddItem(){

        var input,newItem;

        //1.Get the filed input data
        input = UiC.getInput();
        
        if( input.description !== "" &&  !isNaN(input.value) && input.value > 0 ){

            //2.Add the item to the budget controller
            newItem = bgC.addItem(input.type,input.description,input.value);
            bgC.testing();

            //3.Add the item to the UI
            UiC.addListItem(newItem,input.type);

            //4.Clear the fields
            UiC.clearFields();

            //5.Calculate and update budget
            updateBudget();

            //6.CalculatePercentages
            updatePercentages();
        }
    };

    function ctrlDeleteItem(event){ 

        //console.log(event.target.parentNode.parentNode.parentNode.parentNode.id);

        var itemID,splitID,type,ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {

            //inc-1
            splitID = itemID.split('-');    
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1.Delete the item from the data structure
            bgC.deleteItem(type,ID);

            //2.Delete the item from the UI
            UiC.deleteListItem(itemID);

            //3.Update and show the new budget
            updateBudget();

            //4.CalculatePercentages
            updatePercentages();
        }
    }

    function updateBudget(){

        //1.Calculate Budget
        bgC.calculateBudget();

        //2.Return the budget
        var budget = bgC.getBudget();

        //3.Display the budget to the UI
        UiC.displayBudget(budget);
        
    };

    function updatePercentages(){

        //1.Calculate percentages
        bgC.calculatePercentages();

        //2.Read percentages from the budget controller
        var percentages = bgC.getPercentages();

        //3.Update the UI with the new percentages
        UiC.displayPercentages(percentages);

        
    }

    return {

        init : function(){

            UiC.displayBudget({
                
                budget : 0,
                income : 0,
                expense : 0,
                percentage : -1

            });

            UiC.displayMonth();
            setupEventListeners();

        }

    }


})(budgetController,UIController);


controller.init();