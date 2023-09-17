// Handle validation on invalid date/time values.
// GITHUB 
const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../app'); 
const request = supertest(app);

const { v4: uuidv4 } = require('uuid');


describe('POST/receipts/process',()=>{
    it('successfully processes a receipt and returns an id ', ()=> {
        const receiptData = {
            retailer: 'Sample Retailer',
            purchaseDate: '2023-09-15',
            purchaseTime: '15:30',
            items: [
              {
                shortDescription: 'Item 1',
                price: '10.99',
              },
            ],
            total: '10.99',
          };
      
          request.post('/receipts/process')
                 .send(receiptData)
                 .expect(200)
                 .end((err, res) => {
                    if (err) return done(err);
                    expect(res.body).to.have.property('id');
                    expect(res.body.id).to.be.a('string');
            
            });
        });
});
// Check again
describe('GET/receipts/:id/points',()=>{
    describe('successfully gets the points given a reciept id',(done)=>{
        it('should return the points for a valid receipt ID', async() => {
            const validReceiptId = "12345";
       
            const res = await request.get(`/receipts/12345/points`);
            console.log("Response",res);
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('points');
            done();
        });
    });

    describe('Receipt not found',()=>{
        it('should throw an appropriate error when ID is not found', (done) => {
            const invalidReceiptId = 'byx1cby';
      
            request.get(`/receipts/${invalidReceiptId}/points`)
              .expect(404)
              .end((err, res) => {
                if (err) return done(err);
      
                expect(res.body).to.have.property('error');
                expect(res.body.error).to.equal('Receipt not found');
      
                done();
              });
          });
        });
    });

describe('Receipt Processing', () => {
  it('should trim item descriptions', (done) => {
    const receiptData = {
      retailer: 'Sample Retailer',
      purchaseDate: '2023-09-15',
      purchaseTime: '15:30',
      items: [
        {
          shortDescription: '   Item 1  ', // Item description with leading/trailing spaces
          price: '10.99',
        },
      ],
      total: '10.99',
    };


    request.post('/receipts/process')
           .send(receiptData)
            .end((err, res) => {
        expect(200);
        console.log("Response body",res.body);

        const receiptId = res.body.id;
        request.get(`/receipts/${receiptId}/points`)
        .end((err, res) => {
          expect(200);
          console.log("Receipt data response", res.body);
          if (res.body && Array.isArray(res.body.items) && res.body.items.length > 0) {
            const trimmedDescription = res.body.items[0].shortDescription;
            expect(trimmedDescription).to.equal('Item 1');
          } else {
            console.error("Invalid response structure or empty items array");
          }
          done();
      });

    });
  });

  it('should award 50 points for a round total', async () => {
    const receiptData = {
      retailer: 'Sample Retailer',
      purchaseDate: '2023-09-15',
      purchaseTime: '15:30',
      items: [
        {
          shortDescription: 'Item 1',
          price: '9.00',
        },
      ],
      total: '9.00',
    };
  
    const postResponse = await request.post('/receipts/process').send(receiptData);
    expect(postResponse.status).to.equal(200);
  
    const receiptId = postResponse.body.id;
  
    // Send a GET request to retrieve points
    const getResponse = await request.get(`/receipts/${receiptId}/points`);
    expect(getResponse.status).to.equal(200);
    expect(getResponse.body.points).to.equal(101);
        // Points after rule 1 14
        // Points after rule 2 64
        // Points after rule 3 89
        // Points after rule 4 89
        // Points after rule 5 91
        // Points after rule 7 i.e. total = 101
  });
  

});
