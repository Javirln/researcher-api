'use strict';

const chai = require('chai');
chai.use(require('chai-things'));
chai.use(require('chai-http'));
const expect = chai.expect;
const researchers = require('../routes/researchers-service');
const tokens = require('../routes/tokens-service');
const app = require('../server');

describe('Testing Researchers API functionalities', function() {
    beforeEach(function(done) {
        researchers.connectDb((err) => {
            if (err) {
                return done(err);
            }

            researchers.removeAll(function(err) {
                if (err) {
                    return done(err);
                }

                researchers.add([{
                    orcid: "0000-0002-1825-0097",
                    name: "Pepe",
                    phone: "654657748",
                    email: "pepe@us.com",
                    address: "Sevilla",
                    gender: "male"
                }, {
                    orcid: "0000-0002-1825-0098",
                    name: "Anne",
                    phone: "722548896",
                    email: "anne@london.com",
                    address: "London",
                    gender: "female"
                }], done);
            });
        });
    });

    describe('#allResearchers()', function() {
        it('should return all researchers', function(done) {
            researchers.allResearchers((err, res) => {
                if (err) {
                    return done(err);
                }

                expect(res).to.have.lengthOf(2);
                expect(res).to.contain.an.item.with.property('name', 'Pepe');
                expect(res).to.contain.an.item.with.property('name', 'Anne');
                done();
            });
        });
    });

    describe('#get()', function() {
        it('should return one researcher', function(done) {
            researchers.get('0000-0002-1825-0097', (err, res) => {
                if (err) {
                    return done(err);
                }

                expect(res).to.have.lengthOf(1);
                expect(res).to.contain.an.item.with.property('name', 'Pepe');
                done();
            });
        });
    });

    describe('#add()', function() {
        it('should add one more researcher to the default list', function(done) {
            researchers.add([{
                orcid: "0000-0002-1825-0099",
                name: "Manuel",
                phone: "987654321",
                email: "manuel@us.com",
                address: "Sevilla",
                gender: "male"
            }], (err) => {

                if (err) {
                    return done(err);
                }

                researchers.allResearchers((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    expect(res).to.have.lengthOf(3);
                    expect(res).to.contain.an.item.with.property('name', 'Pepe');
                    expect(res).to.contain.an.item.with.property('name', 'Anne');
                    expect(res).to.contain.an.item.with.property('name', 'Manuel');
                    done();
                });
            });
        });
    });

    describe('#removeAll()', function() {
        it('should delete all the researchers', function(done) {
            researchers.removeAll((err) => {
                if (err) {
                    return done(err);
                }

                researchers.allResearchers((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    expect(res).to.have.lengthOf(0);
                    done();
                });
            });
        });
    });

    describe('#remove()', function() {
        it('should delete one researcher of the default list', function(done) {
            researchers.remove('0000-0002-1825-0097', (err) => {
                if (err) {
                    return done(err);
                }

                researchers.allResearchers((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    expect(res).to.have.lengthOf(1);
                    expect(res).not.to.contain.an.item.with.property('name', 'Pepe');
                    expect(res).to.contain.an.item.with.property('name', 'Anne');
                    done();
                });
            });
        });
    });

    describe('#update()', function() {
        it('should update one researcher of the default list', function(done) {
            researchers.update('0000-0002-1825-0097', {
                orcid: "0000-0002-1825-0099",
                name: "Manuel",
                phone: "987654321",
                email: "manuel@us.com",
                address: "Sevilla",
                gender: "male"
            }, (err) => {
                if (err) {
                    return done(err);
                }

                researchers.allResearchers((err, res) => {
                    if (err) {
                        return done(err);
                    }

                    expect(res).to.have.lengthOf(2);
                    expect(res).to.contain.an.item.with.property('name', 'Manuel');
                    expect(res).to.contain.an.item.with.property('orcid', '0000-0002-1825-0099');
                    expect(res).to.contain.an.item.with.property('name', 'Anne');
                    done();
                });
            });
        });
    });
});

describe('Testing API Code status responses', function() {
    beforeEach(function(done) {
        researchers.connectDb((err) => {
            if (err) {
                return done(err);
            }

            researchers.removeAll(function(err) {
                if (err) {
                    return done(err);
                }

                researchers.add([{
                    orcid: "0000-0002-1825-0097",
                    name: "Pepe",
                    phone: "654657748",
                    email: "pepe@us.com",
                    address: "Sevilla",
                    gender: "male"
                }, {
                    orcid: "0000-0002-1825-0098",
                    name: "Anne",
                    phone: "722548896",
                    email: "anne@london.com",
                    address: "London",
                    gender: "female"
                }]);
            });
        });
        tokens.connectDb((err) => {
            if (err) {
                return done(err);
            }

            tokens.removeAll(function(err) {
                if (err) {
                    return done(err);
                }

                tokens.addWithToken({
                    orcid: "49561474Q",
                    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTI3NjYyMjQsImV4cCI6MTQ5Mzk3NTgyNH0.WExNusVFHUcM6LKCwp3cz2SudqM1-CWF3DCZZIPNF-E",
                    apicalls: 0
                }, done);
            });
        });
    });

    describe('HTTP - GET all', function() {
        it('should return 200', function(done) {
            chai.request(app)
                .get('/api/v1/researchers')
                .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTI3NjYyMjQsImV4cCI6MTQ5Mzk3NTgyNH0.WExNusVFHUcM6LKCwp3cz2SudqM1-CWF3DCZZIPNF-E')
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    expect(res.body).to.have.lengthOf(2);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('HTTP - GET one', function() {
        it('should return 200', function(done) {
            chai.request(app)
                .get('/api/v1/researchers/0000-0002-1825-0097')
                .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTI3NjYyMjQsImV4cCI6MTQ5Mzk3NTgyNH0.WExNusVFHUcM6LKCwp3cz2SudqM1-CWF3DCZZIPNF-E')
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    expect(res.body).to.have.lengthOf(1);
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('HTTP - GET non-existing one', function() {
        it('should return 404', function(done) {
            chai.request(app)
                .get('/api/v1/researchers/55578945B')
                .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTI3NjYyMjQsImV4cCI6MTQ5Mzk3NTgyNH0.WExNusVFHUcM6LKCwp3cz2SudqM1-CWF3DCZZIPNF-E')
                .end(function(err, res) {
                    if (err && res.status === 404) {
                        expect(res).to.have.status(404);
                        done();
                    }
                    else {
                        return done(err);
                    }
                });
        });
    });

    describe('HTTP - POST new researcher', function() {
        it('should return 201', function(done) {
            chai.request(app)
                .post('/api/v1/researchers/')
                .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTI3NjYyMjQsImV4cCI6MTQ5Mzk3NTgyNH0.WExNusVFHUcM6LKCwp3cz2SudqM1-CWF3DCZZIPNF-E')
                .send({
                    orcid: "0000-0002-1825-0099",
                    name: "Manuel",
                    phone: "987654321",
                    email: "manuel@us.com",
                    address: "Sevilla",
                    gender: "male"
                })
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    expect(res).to.have.status(201);
                    done();
                });
        });
    });

    describe('HTTP - POST over existing researcher', function() {
        it('should return 409', function(done) {
            chai.request(app)
                .post('/api/v1/researchers/')
                .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTI3NjYyMjQsImV4cCI6MTQ5Mzk3NTgyNH0.WExNusVFHUcM6LKCwp3cz2SudqM1-CWF3DCZZIPNF-E')
                .send({
                    orcid: "0000-0002-1825-0098",
                    name: "Anne",
                    phone: "722548896",
                    email: "anne@london.com",
                    address: "London",
                    gender: "female"
                })
                .end(function(err, res) {
                    if (err && res.status === 409) {
                        expect(res).to.have.status(409);
                        done();
                    }
                    else {
                        return done(err);
                    }
                });
        });
    });

    describe('HTTP - PUT existing researcher', function() {
        it('should return 200', function(done) {
            chai.request(app)
                .put('/api/v1/researchers/0000-0002-1825-0098')
                .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTI3NjYyMjQsImV4cCI6MTQ5Mzk3NTgyNH0.WExNusVFHUcM6LKCwp3cz2SudqM1-CWF3DCZZIPNF-E')
                .send({
                    orcid: "0000-0002-1825-0098",
                    name: "NewAnne",
                    phone: "987654322",
                    email: "newanne@us.com",
                    address: "London",
                    gender: "female"
                })
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }
                    expect(res).to.have.status(200);
                    done();
                });
        });
    });

    describe('HTTP - PUT non-existing researcher', function() {
        it('should return 404', function(done) {
            chai.request(app)
                .put('/api/v1/researchers/11224455V')
                .set('Authorization', 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTI3NjYyMjQsImV4cCI6MTQ5Mzk3NTgyNH0.WExNusVFHUcM6LKCwp3cz2SudqM1-CWF3DCZZIPNF-E')
                .send({
                    orcid: "0000-0002-1825-0098",
                    name: "NewAnne",
                    phone: "987654322",
                    email: "newanne@us.com",
                    address: "London",
                    gender: "female"
                })
                .end(function(err, res) {
                    if (err && res.status === 404) {
                        expect(res).to.have.status(404);
                        done();
                    }
                    else {
                        return done(err);
                    }
                });
        });
    });

    /* WITHOUT TOKEN */

    describe('HTTP - GET all unauthorized', function() {
        it('should return 401', function(done) {
            chai.request(app)
                .get('/api/v1/researchers')
                .end(function(err, res) {
                    if (err && res.status === 401) {
                        expect(res).to.have.status(401);
                        done();
                    }
                    else {
                        return done(err);
                    }
                });
        });
    });

    describe('HTTP - GET all token invalid', function() {
        it('should return 401', function(done) {
            chai.request(app)
                .get('/api/v1/researchers')
                .set('Authorization', 'Bearer ThisIsABadToken')
                .end(function(err, res) {
                    if (err && res.status === 401) {
                        expect(res).to.have.status(401);
                        done();
                    }
                    else {
                        return done(err);
                    }
                });
        });
    });

    describe('HTTP - GET one unauthorized', function() {
        it('should return 401', function(done) {
            chai.request(app)
                .get('/api/v1/researchers/0000-0002-1825-0097')
                .end(function(err, res) {
                    if (err && res.status === 401) {
                        expect(res).to.have.status(401);
                        done();
                    }
                    else {
                        return done(err);
                    }
                });
        });
    });

    describe('HTTP - GET one token invalid', function() {
        it('should return 401', function(done) {
            chai.request(app)
                .get('/api/v1/researchers/0000-0002-1825-0097')
                .set('Authorization', 'Bearer ThisIsABadToken')
                .end(function(err, res) {
                    if (err && res.status === 401) {
                        expect(res).to.have.status(401);
                        done();
                    }
                    else {
                        return done(err);
                    }
                });
        });
    });

    describe('HTTP - POST new researcher unauthorized', function() {
        it('should return 401', function(done) {
            chai.request(app)
                .post('/api/v1/researchers/')
                .send({
                    orcid: "0000-0002-1825-0099",
                    name: "Manuel",
                    phone: "987654321",
                    email: "manuel@us.com",
                    address: "Sevilla",
                    gender: "male"
                })
                .end(function(err, res) {
                    if (err && res.status === 401) {
                        expect(res).to.have.status(401);
                        done();
                    }
                    else {
                        return done(err);
                    }
                });
        });
    });

    describe('HTTP - POST new researcher token invalid', function() {
        it('should return 401', function(done) {
            chai.request(app)
                .post('/api/v1/researchers/')
                .set('Authorization', 'Bearer ThisIsABadToken')
                .send({
                    orcid: "0000-0002-1825-0099",
                    name: "Manuel",
                    phone: "987654321",
                    email: "manuel@us.com",
                    address: "Sevilla",
                    gender: "male"
                })
                .end(function(err, res) {
                    if (err && res.status === 401) {
                        expect(res).to.have.status(401);
                        done();
                    }
                    else {
                        return done(err);
                    }
                });
        });
    });

    describe('HTTP - PUT existing researcher unauthorized', function() {
        it('should return 401', function(done) {
            chai.request(app)
                .put('/api/v1/researchers/0000-0002-1825-0098')
                .send({
                    orcid: "0000-0002-1825-0098",
                    name: "NewAnne",
                    phone: "987654322",
                    email: "newanne@us.com",
                    address: "London",
                    gender: "female"
                })
                .end(function(err, res) {
                    if (err && res.status === 401) {
                        expect(res).to.have.status(401);
                        done();
                    }
                    else {
                        return done(err);
                    }
                });
        });
    });

    describe('HTTP - PUT existing researcher token invalid', function() {
        it('should return 401', function(done) {
            chai.request(app)
                .put('/api/v1/researchers/0000-0002-1825-0098')
                .set('Authorization', 'Bearer ThisIsABadToken')
                .send({
                    orcid: "0000-0002-1825-0098",
                    name: "NewAnne",
                    phone: "987654322",
                    email: "newanne@us.com",
                    address: "London",
                    gender: "female"
                })
                .end(function(err, res) {
                    if (err && res.status === 401) {
                        expect(res).to.have.status(401);
                        done();
                    }
                    else {
                        return done(err);
                    }
                });
        });
    });


});
