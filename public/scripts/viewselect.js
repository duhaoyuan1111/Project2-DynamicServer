var states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL',
    'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME',
    'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV',
    'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA',
    'VT', 'WA', 'WI', 'WV', 'WY'];

var energy_types = {
    coal: 'Coal',
    natural_gas: 'Natural Gas',
    nuclear: 'Nuclear',
    petroleum: 'Petroleum',
    renewable: 'Renewable'
};

function Init() {
    SearchTypeChanged();
}

function SearchTypeChanged() {
    var view_type = document.getElementById('view_type');
    if (view_type.value === 'year') {
        PopulateSearchValueYears();
    }
    else if (view_type.value === 'state') {
        PopulateSearchValueStates();
    }
    else {
        PopulateSearchValueEnergyType();
    }
}

function SubmitView() {
    var view_type = document.getElementById('view_type');
    var view_value = document.getElementById('view_value');

    window.location = '/' + view_type.value + '/' + view_value.value;
}

function RemoveAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function PopulateSearchValueYears() {
    var view_value = document.getElementById('view_value');
    RemoveAllChildren(view_value);
    for (let i = 1960; i <= 2017; i++) {
        let option = document.createElement('option');
        option.value = i.toString();
        option.textContent = i.toString();
        view_value.appendChild(option);
    }
}

function PopulateSearchValueStates() {
    var view_value = document.getElementById('view_value');
    RemoveAllChildren(view_value);
    for (let i = 0; i < states.length; i++) {
        let option = document.createElement('option');
        option.value = states[i];
        option.textContent = states[i];
        view_value.appendChild(option);
    }
}

function PopulateSearchValueEnergyType() {
    var view_value = document.getElementById('view_value');
    RemoveAllChildren(view_value);
    for (let key in energy_types) {
        let option = document.createElement('option');
        option.value = key;
        option.textContent = energy_types[key];
        view_value.appendChild(option);
    }
}
