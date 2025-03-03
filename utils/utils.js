function formatPhone(phone) {
    const regex = /^\+?(\d{2})?(\d{2})(\d{4,5})(\d{4})$/;

    return phone.replace(regex, (_, country, ddd, part1, part2) => {
        const formattedCountry = country ? `+${country} ` : "+55 ";
        return `${formattedCountry}(${ddd}) ${part1}-${part2}`;
    });
}

module.exports = { formatPhone };
