(function() {
    const core = window.SoufitCore = window.SoufitCore || {};

    function validateWorkoutInput(data) {
        if (!data || !data.name) {
            return { valid: false, message: 'Por favor, digite um nome para a missao.' };
        }
        if (!data.day) {
            return { valid: false, message: 'Por favor, selecione um dia da semana.' };
        }
        return { valid: true };
    }

    function validateWeightInput(data) {
        if (!data || !data.date) {
            return { valid: false, message: 'Por favor, selecione uma data.' };
        }
        if (!Number.isFinite(data.weight) || data.weight <= 0) {
            return { valid: false, message: 'Por favor, digite um peso valido.' };
        }
        if (data.weight > 300) {
            return { valid: false, message: 'Peso invalido. Digite um valor realista.' };
        }
        return { valid: true };
    }

    function validateFoodLogInput(data) {
        if (!data || !data.name) {
            return { valid: false, message: 'Por favor, preencha o nome do alimento.' };
        }
        if (!data.quantity) {
            return { valid: false, message: 'Por favor, preencha a quantidade.' };
        }
        return { valid: true };
    }

    function validateDietInput(data) {
        if (!data || !data.name) {
            return { valid: false, message: 'Informe o nome da dieta.' };
        }
        return { valid: true };
    }

    core.validation = {
        validateWorkoutInput,
        validateWeightInput,
        validateFoodLogInput,
        validateDietInput
    };
})();
