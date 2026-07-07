import Service from '../models/Service.js';

export const getServices = async (req, res) => {
  const { providerId, category } = req.query;

  try {
    let query = {};
    if (providerId) query.providerId = providerId;
    if (category) query.category = category;

    const services = await Service.find(query).populate('providerId', 'name email phone');
    res.json(services);
  } catch (error) {
    console.error('Fetch services error:', error);
    res.status(500).json({ message: 'Server error. Failed to fetch services.', error: error.message });
  }
};

export const createService = async (req, res) => {
  const { serviceName, category, description, price, duration } = req.body;

  try {
    const service = await Service.create({
      serviceName,
      category,
      description,
      price,
      duration: duration || 60,
      providerId: req.user._id
    });

    res.status(201).json(service);
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Server error. Failed to create service.', error: error.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    if (service.providerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only the service owner can modify this service.' });
    }

    service.serviceName = req.body.serviceName || service.serviceName;
    service.category = req.body.category || service.category;
    service.description = req.body.description !== undefined ? req.body.description : service.description;
    service.price = req.body.price !== undefined ? req.body.price : service.price;
    service.duration = req.body.duration !== undefined ? req.body.duration : service.duration;

    const updated = await service.save();
    res.json(updated);
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Server error. Failed to update service.', error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    if (service.providerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. Only the service owner can delete this service.' });
    }

    await service.deleteOne();
    res.json({ message: 'Service deleted successfully.' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Server error. Failed to delete service.', error: error.message });
  }
};
