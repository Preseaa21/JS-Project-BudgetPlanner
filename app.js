// =================== BUDGET CONTROLLER ======================================
var budgetController = (function () {
    // function constructors to create new incomes and/or expenses
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
         if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
         }
         else {
            this.percentage = -1;
         }   
    };
    
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };
    
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum; // store the total in the data object
    };
    
    //storing all input data in 1 data object
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1 // -1 initially because percentage does not exist yet
    };
    
    return {
        addItem: function (type, des, val) {
            
            var newItem, ID;
           
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // ID = last ID +1
            } else {
                ID = 0;
            }
            
            // Create new item based on type inc/exp
            if (type === 'exp') {
               newItem = new Expense(ID, des, val); 
            } 
            else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //add new item at the end of the array
            data.allItems[type].push(newItem);
            // return new element
            return newItem; 
        },
        
        deleteItem: function (type, id) {
            
            var ids, index;
            
            ids = data.allItems[type].map(function (current) {  
                return current.id;    
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function () {
          
            // 1. Calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            
            // 2. Calculate the budget: inc - exp
            data.budget = data.totals.inc - data.totals.exp;
            
            // 3. Calculate % of income that is spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
              
        },
        
        calculatePercentages: function () {
    
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
            
        },
        
        getPercentages: function () {
            var allPercent = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPercent;
            
        },
        
        testing: function () {
            console.log(data);
        }
    };
    
})();



// ============== UI CONTROLLER ==================================
var UIController = (function () {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncLabel: '.budget__income--value',
        budgetExpLabel: '.budget__expenses--value',
        budgetPercentLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel : '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
            var numSplit, int, dec;
            /* + or - before number
            always exactly 2 decimal points -> for nice alignment
            comma separating the thousands 
            */
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
            dec = numSplit[1];
            
            return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
            
        };
    
    var nodeListForEach = function(list, callback) {  
               for (var i = 0; i < list.length; i++) {
                   callback(list[i], i);
               } 
            };

    return {
        // Read input values and return together as 1 object
        getInput: function () {
            return {
            type: document.querySelector(DOMStrings.inputType).value, // inc for income or exp for expenses
            description: document.querySelector(DOMStrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMStrings.inputValue).value) // Turn string into number with parsefloat
            };
        },
        
        addListItem: function (obj, type) {
            var html, newHtml, element;
            // 1. Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            
            // 2. Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber (obj.value, type));
            
            // 3. Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function (selectorID) { 
            var item = document.getElementById(selectorID);
            item.parentNode.removeChild(item);
        },
        
        // Clear input after click or enter
        clearFields: function () {
            var fields, fieldsArr;
            
            // 1. Select fields that need clearing
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            // 2. Turn the list into an array
            fieldsArr = Array.prototype.slice.call(fields);
            
            // 3. Clear input
            fieldsArr.forEach(function (current, i, array) {
                current.value = "";    
            });
            
            // Set focus back on first field
            fieldsArr[0].focus();
        },
        
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.budgetIncLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.budgetExpLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            
            if (obj.percentage > 0) { // Don't show percentage if it is 0 or -1
                document.querySelector(DOMStrings.budgetPercentLabel).textContent = obj.percentage + '%';
            } 
            else {
                document.querySelector(DOMStrings.budgetPercentLabel).textContent = '--'; 
            }
              
        },
        
        displayPercentages: function(percentages) {
            
            var expenseFields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            
            nodeListForEach(expenseFields, function(current, index) {
                if (percentages[index] > 0 ) {
                     current.textContent = percentages[index] + '%';
                }
                else {
                    current.textContent = '--';
                }
            });
            
        },
        
        displayMonth: function () {
            var now, year, month, monthsArr;
            
            now = new Date();
            monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMStrings.dateLabel).textContent = monthsArr[month] + ' ' + year;
            
        },
        
        changedType: function () {
          
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' + 
                DOMStrings.inputValue
            );
            
            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
            
            
        },
        
        // Make the DOMStrings object public by returning it so it's accessible in the entire app
        getDOMStrings: function () {
        return DOMStrings; 
        }
    }
    
})();




// ========================== GLOBAL APP CONTROLLER ========================================
var appController = (function (budgetCtrl, UICtrl) {
    
    var setupEventListeners = function () {
         var DOM = UICtrl.getDOMStrings();
        
        // Add button event listener
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        // Event can also start on pressing RETURN key 
        document.addEventListener('keypress', function (event) {
       
            if (event.keyCode === 13 || event.which === 13) { // Which for older browser compatibility
            ctrlAddItem();
            }
        });
        // Set on container as it is first element that contains all inc & exp => event delegation
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); 
        
        // Change color of edges depending on income or expense
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
        
    };
    
   var updateBudget = function () {
       
       // 1. Calculate budget
       budgetCtrl.calculateBudget();
        
       // 2. Return budget
       var budget = budgetCtrl.getBudget();
        
       // 3. Display budget on UI
       UICtrl.displayBudget(budget);    
   };
    
    var updatePercentages = function () {
      
        // 1. Update %
        budgetCtrl.calculatePercentages();
        
        // 2. Read % form budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update UI
        UICtrl.displayPercentages(percentages);
        
    };
    
    var ctrlAddItem = function () {
        var input, newItem;
        
        // 1. Get field input data
        input = UICtrl.getInput();
        
        // Only add data if there is correct data input
        if (input.description !== "" && !isNaN(input.value) && input.value > 0 ){
            
            // 2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            // 3. Add item to UI
            UICtrl.addListItem(newItem, input.type);
        
            // 4. Clear the fields
            UICtrl.clearFields();
        
            // 5. Calculate and update budget
            updateBudget();  
            
            // 6. Calculate + update %
            updatePercentages();
        }
        
    };
    
    var ctrlDeleteItem = function (event) {
        
        var itemID, splitID, type, ID;
        // Getting the id out of the button => DOM traversing
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete item from the data structure
            budgetController.deleteItem(type, ID);
            
            // 2. Delete item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show new budget
            updateBudget();
            
            // 4. Calculate + update %
            updatePercentages();
            
        }
    };
    
    return { //Return to make it public
        init: function () {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
     

    
    
})(budgetController, UIController);



appController.init();


