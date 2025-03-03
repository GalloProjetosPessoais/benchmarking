function formatPhone(phone) {
    const regex = /^\+?(\d{2})?(\d{2})(\d{4,5})(\d{4})$/;

    return phone.replace(regex, (_, country, ddd, part1, part2) => {
        const formattedCountry = country ? `+${country} ` : "";
        return `${formattedCountry}(${ddd}) ${part1}-${part2}`;
    });
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();
  
    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
  
    return [day, month, year].join('/');
  }