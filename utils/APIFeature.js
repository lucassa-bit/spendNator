class APIFeature {
  constructor(request, query) {
    this.request = request;
    this.query = query;
  }

  filter() {
    let queryStr = JSON.stringify(this.query);
    queryStr = queryStr.replace(/\b{gte|gt|lte|lt}\b/g, (match) => `$${match}`);

    this.query = JSON.parse(queryStr);
    this.request = this.request.find(this.query);

    return this;
  }

  limitFields() {
    // Select fields
    if (this.query.fields) {
      const fields = this.query.fields.strip(',').join(' ');
      fields += ' -__v';
      this.request.select(fields);
    } else {
      this.request.select('-__v');
    }

    return this;
  }

  sort() {
    if (this.query.sort) {
      const sortBy = this.query.sort.split(',').join(' ');

      this.request.sort(sortBy);
    } else {
      this.request.sort('-createdAt');
    }
    return this;
  }

  pagination() {
    const page = this.query.page * 1 || 1;
    const limit = this.query.limit * 1 || 10;
    const skip = (page - 1) * limit;

    this.request = this.request.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeature;
