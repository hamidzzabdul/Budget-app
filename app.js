// Budget controller
var budgetController = (function() {

    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };


    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;

            //make sure our new id  = lastid + 1
            //create a new id
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //create new item based on 'inc' and 'exp
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //push new item into the array
            data.allItems[type].push(newItem)

            //Return the new element
            return newItem;
        },

        deletItems: function(type, id) {
            var ids, index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            })

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);

            }
        },

        calculateBudget: function() {
            //calculate total inc and exp
            calculateTotal('inc')
            calculateTotal('exp')

            //calculate the budget 
            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalexp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testig: () => {
            console.log(data)
        }

    };



})();

// UI Controller

var UIController = (function() {

    var DOMStrings = {
        inputType: '.options',
        inputDescription: '.description',
        inputValue: '.description-value',
        inputBtn: '.add__btn',
        incomeContainer: '.income-list',
        expenseContainer: '.expense-list',
        incomeLabel: '.inc-result',
        expenseLabel: '.exp-result',
        budgetLabel: '.calc-display',
        percentageLabel: '.percentage-label',
        container: '.container'
    }

    //get our inputs
    return {
        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        getDOMStrings: function() {
            return DOMStrings;
        },

        addListItem: (Obj, type) => {
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="items" id="inc-%id"><div class="item-description">%description%</div><div class="right__clearfix"><div class="item-value">%value%</div><button class="delete-btn"><i class="ion-ios-close-outline"></i></button></div>'
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                html = '<div class="items" id="exp-%id"><div class="item-description">%description%</div><div class="right__clearfix"><div class="item__value">- %value%</div><button class="delete-btn"><i class="ion-ios-close-outline"></i></button></div></div>'
            }

            newHtml = html.replace('%id', Obj.id);
            newHtml = newHtml.replace('%description%', Obj.description);
            newHtml = newHtml.replace('%value%', Obj.value);

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            //convert field list to an array
            fieldsArr = Array.prototype.slice.call(fields);

            //loop through the list using for each then clear the inputs
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            //set the focus back to the description input box
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {

            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent = obj.totalexp;

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "--";
            }
        },
        deleteListItem: (selectorId) => {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el)
        }
    }

})();

//Global app controller

var controller = (function(budgetCtrl, UICtrl) {

    var setUpEventListeners = function() {
        var DOM = UICtrl.getDOMStrings()
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItems);
        document.addEventListener('keypress', (e) => {
            if (e.key === 13) {
                ctrlAddItems();
                ctrlDeleteItems();
            }
        })
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItems);
    };


    var updateBudget = function() {
        // 1. calculate the budget 
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        // 3. display the budget to the ui
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItems = function() {
        var input, newItem;

        // 1. Get the input values

        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add item to ui
            UICtrl.addListItem(newItem, input.type);

            //4.clear the input field after entering data 
            UICtrl.clearFields();

            //5. calculate and update the budget
            updateBudget();
        }
    };

    var ctrlDeleteItems = function(event) {
        var itemID, splitID;

        itemID = event.target.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseFloat(splitID[1]);

            // 1. delete from data structure

            budgetCtrl.deletItems(type, ID);

            // 2. delete item from uI

            UICtrl.deleteListItem(itemID);
            // 3. update and show new budget
            updateBudget();
        }

    }

    return {
        init: function() {
            console.log('Application has started')
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalexp: 0,
                percentage: -1
            })
            setUpEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();