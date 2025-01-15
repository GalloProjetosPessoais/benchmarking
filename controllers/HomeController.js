const getHome = async (req, res) => {
  return res.render('home/index', {
    title: 'Dashboard',
    subtitle: '',
  });
}

module.exports = {
  getHome,
}